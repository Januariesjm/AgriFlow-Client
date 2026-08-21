export const supabase = {
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: {
        session: {
          user: { id: "mock-user-id", email: "user@agriflow.com" },
          access_token: "mock-jwt-token",
        },
      },
    }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    }),
  },
}
