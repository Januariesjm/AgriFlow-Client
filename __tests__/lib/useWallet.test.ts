import { renderHook, act } from "@testing-library/react"
import { useWallet } from "@/lib/hooks/useWallet"
import { clientApiGet, clientApiPost } from "@/lib/api-client"
import { useSession } from "@/lib/hooks/useSession"

jest.mock("@/lib/api-client")
jest.mock("@/lib/hooks/useSession")

describe("useWallet Hook", () => {
  const mockSession = {
    session: { user: { id: "user-123", email: "farmer@agriflow.com" } },
    loading: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue(mockSession)
  })

  test("fetches and sets wallet data on session load", async () => {
    const mockWalletData = {
      available_balance: 50000,
      pending_balance: 10000,
      withdrawals: [],
      deposits: [],
    }
    ;(clientApiGet as jest.Mock).mockResolvedValue(mockWalletData)

    const { result } = renderHook(() => useWallet())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.balance).toEqual({ available: 50000, pending: 10000 })
    expect(clientApiGet).toHaveBeenCalledWith("farmer/wallet")
  })

  test("handles withdrawal request validation and submission", async () => {
    ;(clientApiGet as jest.Mock).mockResolvedValue({
      available_balance: 50000,
      pending_balance: 0,
      withdrawals: [],
      deposits: [],
    })
    ;(clientApiPost as jest.Mock).mockResolvedValue({ success: true })

    const { result } = renderHook(() => useWallet())

    await act(async () => {
      await Promise.resolve()
    })

    // Insufficient balance test
    await act(async () => {
      const res = await result.current.requestWithdrawal(60000, "mobile_money")
      expect(res).toBe(false)
    })

    // Valid withdrawal test
    await act(async () => {
      const res = await result.current.requestWithdrawal(20000, "mobile_money")
      expect(res).toBe(true)
    })

    expect(clientApiPost).toHaveBeenCalledWith("farmer/wallet/withdraw", expect.objectContaining({
      amount: 20000,
      method: "mobile_money",
    }))
  })

  test("handles deposit initiation", async () => {
    ;(clientApiGet as jest.Mock).mockResolvedValue({ available_balance: 0, pending_balance: 0, withdrawals: [], deposits: [] })
    ;(clientApiPost as jest.Mock).mockResolvedValue({ success: true })

    const { result } = renderHook(() => useWallet())

    await act(async () => {
      const res = await result.current.initiateDeposit(5000, "+254712345678")
      expect(res).toBe(true)
    })

    expect(clientApiPost).toHaveBeenCalledWith("farmer/wallet/deposit", {
      amount: 5000,
      phone: "+254712345678",
    })
  })
})
