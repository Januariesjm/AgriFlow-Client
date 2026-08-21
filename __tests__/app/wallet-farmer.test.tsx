import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import FarmerWallet from "@/app/dashboard/farmer/wallet/page"
import { useWallet } from "@/lib/hooks/useWallet"

jest.mock("@/lib/hooks/useWallet")

describe("FarmerWallet Page Component", () => {
  const mockRequestWithdrawal = jest.fn()
  const mockInitiateDeposit = jest.fn()
  const mockSavePayoutConfig = jest.fn()
  const mockFetchWalletData = jest.fn()
  const mockSetPayoutConfig = jest.fn()

  const defaultWalletState = {
    balance: { available: 45000, locked: 12000, pending: 8500 },
    withdrawals: [
      { id: "w1", amount: 5000, method: "mobile_money", destination: "254712345678", status: "completed", created_at: new Date().toISOString() },
    ],
    deposits: [
      { id: "d1", amount: 10000, method: "mpesa", reference: "REF123", status: "completed", created_at: new Date().toISOString() },
    ],
    payoutConfig: {
      account_name: "John Mwangi",
      account_number: "254712345678",
      bank_code: "MPESA",
      settlement_schedule: "weekly",
    },
    setPayoutConfig: mockSetPayoutConfig,
    loading: false,
    msg: { type: null, text: "" },
    fetchWalletData: mockFetchWalletData,
    requestWithdrawal: mockRequestWithdrawal,
    initiateDeposit: mockInitiateDeposit,
    savePayoutConfig: mockSavePayoutConfig,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useWallet as jest.Mock).mockReturnValue(defaultWalletState)
  })

  test("renders wallet balance and headings", () => {
    render(<FarmerWallet />)

    expect(screen.getByText("Escrow & Digital Wallet")).toBeInTheDocument()
    expect(screen.getByText(/outbound withdrawal history/i)).toBeInTheDocument()
  })

  test("handles withdrawal modal submit", async () => {
    mockRequestWithdrawal.mockResolvedValue(true)
    render(<FarmerWallet />)

    const withdrawBtn = screen.getByRole("button", { name: /withdraw payout/i })
    fireEvent.click(withdrawBtn)

    const amountInput = screen.getByPlaceholderText(/e\.g\. 10000/i)
    fireEvent.change(amountInput, { target: { value: "2500" } })

    const submitBtn = screen.getByRole("button", { name: /confirm withdrawal/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockRequestWithdrawal).toHaveBeenCalledWith(2500, "mobile_money")
    })
  })

  test("handles deposit modal submit", async () => {
    mockInitiateDeposit.mockResolvedValue(true)
    render(<FarmerWallet />)

    const depositBtn = screen.getByRole("button", { name: /deposit funds/i })
    fireEvent.click(depositBtn)

    const amountInput = screen.getByPlaceholderText(/e\.g\. 5000/i)
    const phoneInput = screen.getByPlaceholderText(/\+254712345678/i)

    fireEvent.change(amountInput, { target: { value: "3000" } })
    fireEvent.change(phoneInput, { target: { value: "254700000000" } })

    const submitBtn = screen.getByRole("button", { name: /send m-pesa stk push/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockInitiateDeposit).toHaveBeenCalledWith(3000, "254700000000")
    })
  })

  test("handles payout configuration submit", async () => {
    mockSavePayoutConfig.mockResolvedValue(true)
    render(<FarmerWallet />)

    const saveConfigBtn = screen.getByRole("button", { name: /update settlement account/i })
    fireEvent.click(saveConfigBtn)

    await waitFor(() => {
      expect(mockSavePayoutConfig).toHaveBeenCalledWith(defaultWalletState.payoutConfig)
    })
  })
})
