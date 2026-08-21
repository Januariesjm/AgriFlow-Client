import { renderHook, act } from "@testing-library/react"
import { useSession } from "@/lib/hooks/useSession"
import { supabase } from "@/lib/supabase"

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}))

describe("useSession Hook", () => {
  const mockSession = {
    user: { id: "user-123", email: "test@agriflow.com" },
    access_token: "mock-access-token",
  }

  const unsubscribeMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
    })
    ;(supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    })
  })

  test("fetches active session on mount and subscribes to auth state changes", async () => {
    const { result } = renderHook(() => useSession())

    // Initial state
    expect(result.current.loading).toBe(true)

    // Wait for session to load
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.session).toEqual(mockSession)
    expect(result.current.token).toBe("mock-access-token")
    expect(supabase.auth.getSession).toHaveBeenCalledTimes(1)
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledTimes(1)
  })

  test("unsubscribes on unmount", async () => {
    const { unmount } = renderHook(() => useSession())
    unmount()
    expect(unsubscribeMock).toHaveBeenCalledTimes(1)
  })
})
