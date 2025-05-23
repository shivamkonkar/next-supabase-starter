import { GET } from './route';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient, mockExchangeCodeForSession } from '@/lib/supabase/server'; // Uses the mock

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock next/server
// We only need to mock NextResponse.redirect for these tests
const mockRedirect = jest.fn();
jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'), // Import and retain default behavior
  NextResponse: {
    ...jest.requireActual('next/server').NextResponse,
    redirect: (...args: any[]) => mockRedirect(...args),
  },
}));

// Mock the Supabase client module
jest.mock('@/lib/supabase/server');

describe('GET /auth/callback', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Clears module cache, if needed for env variables
    process.env = { ...OLD_ENV }; // Make a copy
    
    // Clear mocks before each test
    mockExchangeCodeForSession.mockClear();
    (createClient as jest.Mock).mockClear();
    (revalidatePath as jest.Mock).mockClear();
    mockRedirect.mockClear();

    // Set a default for NEXT_PUBLIC_BASE_URL for most tests
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  const createMockRequest = (searchParams: Record<string, string>): NextRequest => {
    const url = new URL(process.env.NEXT_PUBLIC_BASE_URL!);
    Object.entries(searchParams).forEach(([key, value]) => url.searchParams.set(key, value));
    return {
      url: url.toString(), // Pass the full URL string
      // Add other properties if your handler uses them, e.g., headers
    } as NextRequest;
  };
  
  // Helper to properly construct NextRequest with a URL object
  const createMockRequestWithURLObject = (searchParamsString: string): NextRequest => {
    const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback${searchParamsString}`;
    return new NextRequest(fullUrl);
  };


  it('1. Successful Code Exchange and Redirect (with "next" param)', async () => {
    const request = createMockRequestWithURLObject('?code=testcode&next=/test-redirect');
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });

    await GET(request);

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('testcode');
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(mockRedirect).toHaveBeenCalledWith(new URL('/test-redirect', 'http://localhost:3000'));
  });

  it('2. Successful Code Exchange (Default Redirect to /dashboard)', async () => {
    const request = createMockRequestWithURLObject('?code=testcode');
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });

    await GET(request);

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('testcode');
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(mockRedirect).toHaveBeenCalledWith(new URL('/dashboard', 'http://localhost:3000'));
  });

  it('3. Error during Code Exchange', async () => {
    const request = createMockRequestWithURLObject('?code=testcode');
    const mockError = { message: 'Exchange failed' };
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: mockError });

    await GET(request);

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('testcode');
    expect(revalidatePath).not.toHaveBeenCalled(); 
    
    const expectedRedirectUrl = new URL('/login', 'http://localhost:3000');
    expectedRedirectUrl.searchParams.set('error', 'authentication_failed');
    expectedRedirectUrl.searchParams.set('error_description', 'Could not exchange code for session.');
    expectedRedirectUrl.searchParams.set('details', mockError.message);
    expect(mockRedirect).toHaveBeenCalledWith(expectedRedirectUrl);
  });

  it('4. No Code in URL', async () => {
    const request = createMockRequestWithURLObject('?next=/somepage'); // No 'code'

    await GET(request);

    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();

    const expectedRedirectUrl = new URL('/login', 'http://localhost:3000');
    expectedRedirectUrl.searchParams.set('error', 'authentication_failed');
    expectedRedirectUrl.searchParams.set('error_description', 'Invalid or expired authentication link.');
    expect(mockRedirect).toHaveBeenCalledWith(expectedRedirectUrl);
  });
  
  it('5. NEXT_PUBLIC_BASE_URL is used for redirection', async () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    // Re-create request with the new base URL for URL object inside NextRequest
    const request = new NextRequest('https://example.com/auth/callback?code=testcode&next=/custom');
    
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null });

    await GET(request);
    
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('testcode');
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout'); // revalidatePath is independent of base URL
    expect(mockRedirect).toHaveBeenCalledWith(new URL('/custom', 'https://example.com'));
  });
});
