// This file can be used for global Jest setup
// For example, clearing mocks before each test if not done in the test files themselves.

// jest.mock('@/lib/supabase/server'); // Example: auto-mocking a module

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  // jest.clearAllMocks(); // This might be too broad if some mocks need to persist across describe blocks
});
