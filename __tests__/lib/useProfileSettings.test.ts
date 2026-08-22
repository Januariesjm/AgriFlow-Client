import { renderHook, act } from "@testing-library/react"
import { useProfileSettings } from "@/lib/hooks/useProfileSettings"
import { clientApiGet, clientApiPatch } from "@/lib/api-client"
import { supabase } from "@/lib/supabase"

jest.mock("@/lib/api-client")
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      updateUser: jest.fn(),
    },
  },
}))

describe("useProfileSettings Hook", () => {
  const mockProfile = {
    id: "user-99",
    full_name: "Jane Manager",
    email: "jane@warehouse.com",
    phone: "+254700000000",
    role: "warehouse_owner",
    country: "Kenya",
    region: "Eldoret",
    created_at: "2026-01-01T00:00:00Z",
  }

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  test("fetches profile successfully and populates form fields", async () => {
    ;(clientApiGet as jest.Mock).mockResolvedValue({ profile: mockProfile })

    const { result } = renderHook(() => useProfileSettings())

    await act(async () => {
      await result.current.fetchProfile()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.profile).toEqual(mockProfile)
    expect(result.current.fullName).toBe("Jane Manager")
    expect(result.current.phone).toBe("+254700000000")
    expect(result.current.country).toBe("Kenya")
    expect(result.current.region).toBe("Eldoret")
  })

  test("handles schema validation error when API returns invalid payload", async () => {
    ;(clientApiGet as jest.Mock).mockResolvedValue({ profile: { id: "invalid-payload" } })

    const { result } = renderHook(() => useProfileSettings())

    await act(async () => {
      await result.current.fetchProfile()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe("Profile data payload validation failed.")
  })

  test("handles profile save update", async () => {
    ;(clientApiPatch as jest.Mock).mockResolvedValue({
      profile: { ...mockProfile, full_name: "Jane Updated" },
    })

    const { result } = renderHook(() => useProfileSettings())

    act(() => {
      result.current.setFullName("Jane Updated")
    })

    let success = false
    await act(async () => {
      success = await result.current.handleSaveProfile()
    })

    expect(success).toBe(true)
    expect(result.current.success).toBe("Profile settings saved successfully!")
  })

  test("validates password mismatch on password change", async () => {
    const { result } = renderHook(() => useProfileSettings())

    act(() => {
      result.current.setNewPassword("secret123")
      result.current.setConfirmPassword("mismatch123")
    })

    let success = false
    await act(async () => {
      success = await result.current.handleChangePassword()
    })

    expect(success).toBe(false)
    expect(result.current.passwordError).toBe("Passwords do not match.")
  })

  test("successfully updates user password", async () => {
    ;(supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null })

    const { result } = renderHook(() => useProfileSettings())

    act(() => {
      result.current.setNewPassword("newsecret123")
      result.current.setConfirmPassword("newsecret123")
    })

    let success = false
    await act(async () => {
      success = await result.current.handleChangePassword()
    })

    expect(success).toBe(true)
    expect(result.current.passwordSuccess).toBe("Password changed successfully!")
  })
})
