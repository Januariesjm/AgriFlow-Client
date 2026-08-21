import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import FarmerWallet from "@/app/dashboard/farmer/wallet/page"
import { clientApiGet, clientApiPost } from "@/lib/api-client"
import { useSession } from "@/lib/hooks/useSession"

jest.mock("@/lib/api-client")
jest.mock("@/lib/hooks/useSession")

describe("Farmer Wallet Flow Integration Test", () => {
  const mockWalletData = {
    available_balance: 50000,
    pending_balance: 10000,
    withdrawals: [
      { id: "w-1", amount: 5000, method: "mobile_money", destination: "+254700112233", status: "completed", created_at: "2026-08-01T00:00:00Z" },
    ],
    deposits: [
      { id: "d-1", amount: 10000, method: "mobile_money", reference: "MPESA-12345", status: "completed", created_at: "2026-08-01T00:00:00Z" },
    ],
    payout_config: {
      payoutMethod: "mobile_money" as const,
      mobileProvider: "M-PESA",
      mobilePhone: "+254700112233",
      bankName: "",
      accountName: "",
      accountNumber: "",
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue({
      session: { user: { id: "farmer-1", email: "farmer@agriflow.com" } },
      loading: false,
    })
    ;(clientApiGet as jest.Mock).mockResolvedValue(mockWalletData)
  })

  test("renders wallet balance headers and ledger records from API", async () => {
    render(<FarmerWallet />)

    await waitFor(() => {
      expect(screen.getByText("Available for Cashout")).toBeInTheDocument()
      expect(screen.getByText("Pending Escrow Hold")).toBeInTheDocument()
    })
  })

  test("opens withdraw modal, submits withdrawal request, and verifies API call", async () => {
    ;(clientApiPost as jest.Mock).mockResolvedValue({ status: "success" })

    render(<FarmerWallet />)

    await waitFor(() => {
      expect(screen.getByText("Available for Cashout")).toBeInTheDocument()
    })

    // Click Withdraw Payout button
    const withdrawBtn = screen.getByRole("button", { name: /withdraw payout/i })
    fireEvent.click(withdrawBtn)

    // Verify modal elements are present
    const amountInput = screen.getByPlaceholderText(/e.g. 10000/i)
    fireEvent.change(amountInput, { target: { value: "2000" } })

    // Submit withdrawal form
    const submitBtn = screen.getByRole("button", { name: /confirm withdrawal/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(clientApiPost).toHaveBeenCalledWith("farmer/wallet/withdraw", {
        amount: 2000,
        method: "mobile_money",
        destination: "+254700112233",
      })
    })
  })

  test("opens deposit modal, submits deposit request, and verifies STK push call", async () => {
    ;(clientApiPost as jest.Mock).mockResolvedValue({ status: "success" })

    render(<FarmerWallet />)

    await waitFor(() => {
      expect(screen.getByText("Available for Cashout")).toBeInTheDocument()
    })

    // Click Deposit Funds button
    const depositBtn = screen.getByRole("button", { name: /deposit funds/i })
    fireEvent.click(depositBtn)

    // Fill in deposit form
    const amountInput = screen.getByPlaceholderText(/e.g. 5000/i)
    const phoneInputs = screen.getAllByPlaceholderText("+254712345678")
    const phoneInput = phoneInputs[phoneInputs.length - 1]

    fireEvent.change(amountInput, { target: { value: "5000" } })
    fireEvent.change(phoneInput, { target: { value: "254712345678" } })

    // Submit deposit form
    const submitBtn = screen.getByRole("button", { name: /send m-pesa stk push/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(clientApiPost).toHaveBeenCalledWith("farmer/wallet/deposit", {
        amount: 5000,
        phone: "254712345678",
      })
    })
  })
})
