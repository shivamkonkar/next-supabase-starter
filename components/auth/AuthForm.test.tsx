import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthForm } from './AuthForm';
import { mockSendMagicLink, mockSignInWithGoogle } from '@/lib/actions/__mocks__/authActions'; // Correct path to our mock

// Explicitly mock the actions module
jest.mock('@/lib/actions/authActions');

// Now Jest will automatically use components/icons/__mocks__/GoogleIcon.tsx
jest.mock('@/components/icons/GoogleIcon'); 

describe('AuthForm', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Reset mocks before each test
    mockSendMagicLink.mockClear();
    mockSignInWithGoogle.mockClear();

    // Setup mock for window.location.href
    // https://www.benmvp.com/blog/mocking-window-location-javascript-jest/
    // We need to delete it first because it's a read-only property.
    delete (window as any).location;
    window.location = { ...originalLocation, assign: jest.fn(), href: '' } as any;
  });

  afterEach(() => {
    // Restore window.location
    window.location = originalLocation;
  });

  describe('Initial Rendering', () => {
    it('should render with no initial messages or errors', () => {
      render(<AuthForm authActionType="login" />);
      expect(screen.queryByText(/Link sent!/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Failed to send/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Google auth failed/i)).not.toBeInTheDocument();
    });
  });

  describe('Magic Link Functionality', () => {
    // Test for both "login" and "signup" types
    (['login', 'signup'] as const).forEach((actionType) => {
      describe(`authActionType="${actionType}"`, () => {
        const submitButtonText = actionType === 'login' ? /Login with Email/i : /Sign up with Email/i;

        it('renders correctly with email input and submit button', () => {
          render(<AuthForm authActionType={actionType} />);
          expect(screen.getByPlaceholderText(/email@example.com/i)).toBeInTheDocument();
          expect(screen.getByRole('button', { name: submitButtonText })).toBeInTheDocument();
        });

        it('allows user to type into email input', () => {
          render(<AuthForm authActionType={actionType} />);
          const emailInput = screen.getByPlaceholderText(/email@example.com/i) as HTMLInputElement;
          fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
          expect(emailInput.value).toBe('test@example.com');
        });

        it('submits magic link successfully', async () => {
          mockSendMagicLink.mockResolvedValueOnce({ success: true, message: 'Link sent!' });
          render(<AuthForm authActionType={actionType} />);
          
          const emailInput = screen.getByPlaceholderText(/email@example.com/i);
          const submitButton = screen.getByRole('button', { name: submitButtonText });

          fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
          fireEvent.click(submitButton);

          expect(submitButton).toBeDisabled(); // Check loading state

          await waitFor(() => {
            expect(mockSendMagicLink).toHaveBeenCalledTimes(1);
            const formData = mockSendMagicLink.mock.calls[0][0] as FormData;
            expect(formData.get('email')).toBe('test@example.com');
            expect(formData.get('authActionType')).toBe(actionType);
          });
          
          await waitFor(() => expect(screen.getByText(/Link sent!/i)).toBeInTheDocument());
          expect((emailInput as HTMLInputElement).value).toBe(''); // Email input cleared
          expect(submitButton).not.toBeDisabled(); // Check loading state resolved
        });

        it('handles magic link submission failure', async () => {
          mockSendMagicLink.mockResolvedValueOnce({ success: false, error: 'Failed to send.' });
          render(<AuthForm authActionType={actionType} />);

          const emailInput = screen.getByPlaceholderText(/email@example.com/i);
          const submitButton = screen.getByRole('button', { name: submitButtonText });

          fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
          fireEvent.click(submitButton);
          
          expect(submitButton).toBeDisabled();

          await waitFor(() => {
            expect(mockSendMagicLink).toHaveBeenCalledTimes(1);
          });

          await waitFor(() => expect(screen.getByText(/Failed to send./i)).toBeInTheDocument());
          expect((emailInput as HTMLInputElement).value).toBe('test@example.com'); // Email not cleared on error
          expect(submitButton).not.toBeDisabled();
        });
      });
    });
  });

  describe('Google OAuth Functionality', () => {
    it('renders the "Continue with Google" button', () => {
      render(<AuthForm authActionType="login" />);
      expect(screen.getByRole('button', { name: /Google/i })).toBeInTheDocument();
      expect(screen.getByTestId('google-icon')).toBeInTheDocument();
    });

    it('handles Google Sign-In success and redirects', async () => {
      const mockUrl = 'http://mock-google-url.com';
      mockSignInWithGoogle.mockResolvedValueOnce({ success: true, url: mockUrl });
      
      render(<AuthForm authActionType="login" />);
      const googleButton = screen.getByRole('button', { name: /Google/i });
      fireEvent.click(googleButton);

      expect(googleButton).toBeDisabled();

      await waitFor(() => expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(window.location.href).toBe(mockUrl));
      // Button might still be disabled as page redirects. If not, add:
      // await waitFor(() => expect(googleButton).not.toBeDisabled());
    });

    it('handles Google Sign-In failure and displays error', async () => {
      mockSignInWithGoogle.mockResolvedValueOnce({ success: false, error: 'Google auth failed.' });
      
      render(<AuthForm authActionType="login" />);
      const googleButton = screen.getByRole('button', { name: /Google/i });
      fireEvent.click(googleButton);

      expect(googleButton).toBeDisabled();

      await waitFor(() => expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1));
      
      // Need to find where the error message is rendered. Assuming it's in a div.
      // If AuthForm doesn't display Google OAuth errors directly, this part needs adjustment.
      // For now, let's assume there's a generic error display area.
      // We added an `error` state display in a previous step for AuthForm, so it should show up.
      // Let's check if the error message set by setError(result.error || 'An error occurred.') appears.
      await waitFor(() => expect(screen.getByText(/Google auth failed./i)).toBeInTheDocument());
      
      expect(window.location.href).not.toBe('http://mock-google-url.com');
      expect(googleButton).not.toBeDisabled();
    });
  });
});
