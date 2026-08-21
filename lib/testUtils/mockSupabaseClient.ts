export function createMockSupabaseClient(overrides: Record<string, unknown> = {}) {
  return {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: "mock-access-token",
            user: { id: "test-user-id", email: "test@agriflow.com" },
          },
        },
        error: null,
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: {
          subscription: { unsubscribe: jest.fn() },
        },
      }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      ...(overrides.auth as Record<string, unknown>),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      ...(overrides.from as Record<string, unknown>),
    }),
    ...overrides,
  }
}
