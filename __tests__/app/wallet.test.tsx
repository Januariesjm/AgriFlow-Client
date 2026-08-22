import React from "react"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import FarmerWallet from "@/app/dashboard/farmer/wallet/page"
import { useSession } from "@/lib/hooks/useSession"
import { clientApiGet, clientApiPost } from "@/lib/api-client"

jest.mock("@/lib/hooks/useSession")
jest.mock("@/lib/api-client")

describe("FarmerWallet Component", () => {
  const mockSession = {
    session: { user: { id: "user-123", email: "farmer@agriflow.com" }, access_token: "token123" },
    loading: false,
  }

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue(mockSession)
    ;(clientApiGet as jest.Mock).mockResolvedValue({
      available_balance: 145000,
      pending_balance: 28000,
      withdrawals: [
        { id: "w-1", amount: 15000, method: "mobile_money", destination: "+254712345678", status: "completed", created_at: "2026-08-20T10:00:00Z" }
      ],
      deposits: [
        { id: "d-1", amount: 50000, method: "mobile_money", reference: "MPESA-892341", status: "completed", created_at: "2026-08-21T10:00:00Z" }
      ],
    })
    ;(clientApiPost as jest.Mock).mockResolvedValue({ success: true })
  })

  test("renders balance cards and transaction ledgers", async () => {
    render(<FarmerWallet />)

    expect(screen.getByText("Escrow & Digital Wallet")).toBeInTheDocument()
    expect(screen.getByText("Available for Cashout")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("Outbound Withdrawal History")).toBeInTheDocument()
      expect(screen.getByText("Inbound Deposit & Escrow Ledger")).toBeInTheDocument()
    })
  })

  test("opens deposit modal and handles deposit submission", async () => {
    render(<FarmerWallet />)

    await act(async () => {
      await Promise.resolve()
    })

    const depositBtn = screen.getByRole("button", { name: /deposit funds/i })
    fireEvent.click(depositBtn)

    expect(screen.getByText("M-PESA Express Deposit")).toBeInTheDocument()

    const phoneInputs = screen.getAllByPlaceholderText("+254712345678")
    const phoneInput = phoneInputs[phoneInputs.length - 1]
    const amountInput = screen.getByPlaceholderText("e.g. 5000")
    const submitBtn = screen.getByText("Send M-PESA STK Push")

    fireEvent.change(phoneInput, { target: { value: "+254711223344" } })
    fireEvent.change(amountInput, { target: { value: "2500" } })

    await act(async () => {
      fireEvent.click(submitBtn)
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(screen.queryByText("M-PESA Express Deposit")).not.toBeInTheDocument()
    })
  })

  test("opens withdrawal modal and validates amount", async () => {
    render(<FarmerWallet />)

    await act(async () => {
      await Promise.resolve()
    })

    const withdrawBtn = screen.getByRole("button", { name: /withdraw payout/i })
    fireEvent.click(withdrawBtn)

    expect(screen.getByText("Withdraw Funds")).toBeInTheDocument()

    const amountInput = screen.getByPlaceholderText("e.g. 10000")
    fireEvent.change(amountInput, { target: { value: "5000" } })

    const confirmBtn = screen.getByText("Confirm Withdrawal")

    await act(async () => {
      fireEvent.click(confirmBtn)
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(screen.queryByText("Withdraw Funds")).not.toBeInTheDocument()
    })
  })
})
