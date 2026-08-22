import { render, screen, fireEvent } from "@testing-library/react"
import SellCalculator from "@/components/sell/SellCalculator"

describe("SellCalculator Component", () => {
  const mockCropPrices = [
    { id: "maize", name: "Maize", pricePerTon: 220, unit: "ton" },
    { id: "beans", name: "Beans", pricePerTon: 380, unit: "ton" },
  ]

  const mockProps = {
    cropPrices: mockCropPrices,
    selectedCrop: mockCropPrices[0],
    onSelectCrop: jest.fn(),
    quantity: 10,
    onQuantityChange: jest.fn(),
    transportDistance: 50,
    onDistanceChange: jest.fn(),
    grossEarnings: 2200,
    platformFee: 44,
    transportCostEstimate: 125,
    netEarnings: 2031,
  }

  test("renders estimator heading and pricing breakdown values", () => {
    render(<SellCalculator {...mockProps} />)

    expect(screen.getByText("Interactive Earnings Estimator")).toBeInTheDocument()
    expect(screen.getByText("$2,200")).toBeInTheDocument()
    expect(screen.getByText("-$44.00")).toBeInTheDocument()
    expect(screen.getByText("-$125.00")).toBeInTheDocument()
    expect(screen.getByText("$2,031.00")).toBeInTheDocument()
  })

  test("triggers onSelectCrop when a different crop is selected", () => {
    render(<SellCalculator {...mockProps} />)

    const selectEl = screen.getByRole("combobox", { name: /select crop/i })
    fireEvent.change(selectEl, { target: { value: "beans" } })

    expect(mockProps.onSelectCrop).toHaveBeenCalledWith(mockCropPrices[1])
  })

  test("triggers onQuantityChange when quantity range input changes", () => {
    render(<SellCalculator {...mockProps} />)

    const quantitySlider = screen.getByRole("slider", { name: /harvest quantity/i })
    fireEvent.change(quantitySlider, { target: { value: "25" } })

    expect(mockProps.onQuantityChange).toHaveBeenCalledWith(25)
  })

  test("triggers onDistanceChange when distance slider changes", () => {
    render(<SellCalculator {...mockProps} />)

    const distanceSlider = screen.getByRole("slider", { name: /transport distance/i })
    fireEvent.change(distanceSlider, { target: { value: "100" } })

    expect(mockProps.onDistanceChange).toHaveBeenCalledWith(100)
  })
})
