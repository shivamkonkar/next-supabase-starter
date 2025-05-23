import { sendMagicLink, signInWithGoogle } from './authActions';
import { createClient, mockSignInWithOtp, mockSignInWithOAuth } from '@/lib/supabase/server'; // Uses the mock

jest.mock('@/lib/supabase/server'); // Ensure the mock is used

describe('authActions', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
    mockSignInWithOtp.mockClear();
    mockSignInWithOAuth.mockClear();
    (createClient as jest.Mock).mockClear(); 
    // Set a default for NEXT_PUBLIC_BASE_URL for tests
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  describe('sendMagicLink', () => {
    it('should send a signup link successfully when authActionType is "signup"', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('authActionType', 'signup');

      mockSignInWithOtp.mockResolvedValueOnce({ error: null });

      const result = await sendMagicLink(formData);

      expect(createClient).toHaveBeenCalledTimes(1);
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
          shouldCreateUser: true,
        },
      });
      expect(result).toEqual({
        success: true,
        message: 'Login link sent to test@example.com. Please check your inbox.',
      });
    });

    it('should send a login link successfully when authActionType is "login"', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('authActionType', 'login');

      mockSignInWithOtp.mockResolvedValueOnce({ error: null });

      const result = await sendMagicLink(formData);

      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
          shouldCreateUser: false,
        },
      });
      expect(result).toEqual({
        success: true,
        message: 'Login link sent to test@example.com. Please check your inbox.',
      });
    });

    it('should return an error if Supabase signInWithOtp fails', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('authActionType', 'login');
      const mockError = { message: 'Supabase OTP error' };

      mockSignInWithOtp.mockResolvedValueOnce({ error: mockError });

      const result = await sendMagicLink(formData);

      expect(result).toEqual({
        success: false,
        error: `Failed to send login link: ${mockError.message}`,
      });
    });
    
    it('should return an error if Supabase signInWithOtp fails for signup', async () => {
        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('authActionType', 'signup');
        const mockError = { message: 'Supabase OTP error for signup' };
  
        mockSignInWithOtp.mockResolvedValueOnce({ error: mockError });
  
        const result = await sendMagicLink(formData);
  
        expect(result).toEqual({
          success: false,
          error: `Failed to send signup link: ${mockError.message}`,
        });
      });

    it('should return an error if email is not provided', async () => {
      const formData = new FormData();
      formData.append('authActionType', 'login');
      // No email
      const result = await sendMagicLink(formData);
      expect(result).toEqual({ success: false, error: 'Email is required.' });
    });

    it('should return an error if authActionType is not provided', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      // No authActionType
      const result = await sendMagicLink(formData);
      expect(result).toEqual({ success: false, error: 'Auth action type is required.' });
    });
  });

  describe('signInWithGoogle', () => {
    it('should return a URL successfully for Google OAuth', async () => {
      const mockUrl = 'http://mock-google-url.com';
      mockSignInWithOAuth.mockResolvedValueOnce({ data: { url: mockUrl }, error: null });

      const result = await signInWithGoogle();

      expect(createClient).toHaveBeenCalledTimes(1);
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      });
      expect(result).toEqual({ success: true, url: mockUrl });
    });

    it('should return an error if Supabase signInWithOAuth fails', async () => {
      const mockError = { message: 'Supabase OAuth error' };
      mockSignInWithOAuth.mockResolvedValueOnce({ data: null, error: mockError });

      const result = await signInWithGoogle();

      expect(result).toEqual({
        success: false,
        error: `Failed to initiate google sign-in: ${mockError.message}`,
      });
    });

    it('should return an error if no URL is returned from Supabase', async () => {
      mockSignInWithOAuth.mockResolvedValueOnce({ data: { url: null }, error: null });

      const result = await signInWithGoogle();

      expect(result).toEqual({
        success: false,
        error: 'Could not get google sign-in URL.',
      });
    });
  });
});
