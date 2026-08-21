import React from "react"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import WarehouseWallet from "@/app/dashboard/warehouse_owner/wallet/page"
import { useSession } from "@/lib/hooks/useSession"

jest.mock("@/lib/hooks/useSession")

describe("WarehouseWallet Page Component", () => {
  const mockSession = {
    session: {
      user: {
        id: "wh-owner-1",
        email: "warehouse@agriflow.com",
      },
    },
    loading: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    jest.useFakeTimers()
    ;(useSession as jest.Mock).mockReturnValue(mockSession)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test("renders wallet balance headers and metrics", () => {
    render(<WarehouseWallet />)

    expect(screen.getByText("Warehouse Payouts Wallet")).toBeInTheDocument()
    expect(screen.getByText("Available Rent Balance")).toBeInTheDocument()
  })

  test("handles successful withdrawal submit and updates balance", async () => {
    render(<WarehouseWallet />)

    const amountInput = screen.getByPlaceholderText("0.00")
    const phoneInput = screen.getByPlaceholderText("Phone number or Bank Account")

    fireEvent.change(amountInput, { target: { value: "100" } })
    fireEvent.change(phoneInput, { target: { value: "254712345678" } })

    const submitBtn = screen.getByRole("button", { name: /withdraw funds/i })
    fireEvent.click(submitBtn)

    act(() => {
      jest.advanceTimersByTime(1100)
    })

    await waitFor(() => {
      expect(screen.getByText(/payout request of \$100\.00 processed successfully/i)).toBeInTheDocument()
    })
  })

  test("handles error when withdrawal amount exceeds available balance", async () => {
    render(<WarehouseWallet />)

    const amountInput = screen.getByPlaceholderText("0.00")
    const phoneInput = screen.getByPlaceholderText("Phone number or Bank Account")

    fireEvent.change(amountInput, { target: { value: "999999" } })
    fireEvent.change(phoneInput, { target: { value: "254712345678" } })

    const submitBtn = screen.getByRole("button", { name: /withdraw funds/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/insufficient funds in available balance/i)).toBeInTheDocument()
    })
  })
})
