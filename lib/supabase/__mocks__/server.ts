export const mockSignInWithOtp = jest.fn();
export const mockSignInWithOAuth = jest.fn();
export const mockExchangeCodeForSession = jest.fn();

const mockSupabaseClient = {
  auth: {
    signInWithOtp: mockSignInWithOtp,
    signInWithOAuth: mockSignInWithOAuth,
    exchangeCodeForSession: mockExchangeCodeForSession,
  },
};

export const createClient = jest.fn(() => Promise.resolve(mockSupabaseClient));
