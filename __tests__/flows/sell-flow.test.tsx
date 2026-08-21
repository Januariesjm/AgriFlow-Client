import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import SellPage from "@/app/(public)/sell/page"
import { calculateSellEarnings } from "@/lib/calculations/checkout"

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/sell",
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
  },
}))

jest.mock("@/lib/api-client", () => ({
  clientApiGet: jest.fn().mockResolvedValue({ profile: null }),
}))

describe("Sell Flow & Earnings Estimator Integration Test", () => {
  test("renders interactive earnings estimator with default Maize values", () => {
    render(<SellPage />)

    expect(screen.getByText("Interactive Earnings Estimator")).toBeInTheDocument()

    // Default values: Maize ($220/ton), 10 Tons, 50 km
    const defaultEarnings = calculateSellEarnings(220, 10, 50)
    expect(screen.getByText(`$${defaultEarnings.grossEarnings.toLocaleString()}`)).toBeInTheDocument()
    expect(screen.getByText(`-$${defaultEarnings.platformFee.toFixed(2)}`)).toBeInTheDocument()
  })

  test("updates DOM net earnings calculation when crop, quantity, and distance range inputs change", async () => {
    render(<SellPage />)

    // Select Beans ($380/ton)
    const selectCrop = screen.getByRole("combobox")
    fireEvent.change(selectCrop, { target: { value: "beans" } })

    // Change quantity to 20 Tons
    const rangeInputs = screen.getAllByRole("slider")
    const quantitySlider = rangeInputs[0]
    const distanceSlider = rangeInputs[1]

    fireEvent.change(quantitySlider, { target: { value: "20" } })
    fireEvent.change(distanceSlider, { target: { value: "100" } })

    // Beans ($380/ton), 20 Tons, 100 km
    const expectedEarnings = calculateSellEarnings(380, 20, 100)

    await waitFor(() => {
      expect(screen.getByText(`$${expectedEarnings.grossEarnings.toLocaleString()}`)).toBeInTheDocument()
      expect(screen.getByText(`-$${expectedEarnings.platformFee.toFixed(2)}`)).toBeInTheDocument()
      expect(screen.getByText(`-$${expectedEarnings.transportCostEstimate.toFixed(2)}`)).toBeInTheDocument()
    })
  })
})
