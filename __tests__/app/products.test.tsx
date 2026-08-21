import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import Marketplace from "@/app/(public)/products/page"
import { api } from "@/lib/api"

jest.mock("@/lib/api")
jest.mock("@/components/layout/header", () => {
  return function MockHeader() {
    return <header data-testid="mock-header">Header</header>
  }
})
jest.mock("@/components/layout/footer", () => {
  return function MockFooter() {
    return <footer data-testid="mock-footer">Footer</footer>
  }
})

describe("Marketplace Page", () => {
  const mockProducts = [
    {
      id: "prod-1",
      farmer_id: "farmer-1",
      name: "Organic Yellow Corn",
      category: "Grains",
      description: "High quality maize harvest",
      quantity: 500,
      unit: "kg",
      price: 250,
      currency: "KES",
      country: "Kenya",
      region: "Central",
      gps_lat: -1.2,
      gps_lng: 36.8,
      quality_grade: "A",
      status: "active",
      created_at: new Date().toISOString(),
      profiles: { full_name: "John Farmer" },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(api.get as jest.Mock).mockResolvedValue({ products: mockProducts })
  })

  test("renders header, hero title and loads products", async () => {
    render(<Marketplace />)

    expect(screen.getByTestId("mock-header")).toBeInTheDocument()
    expect(screen.getByText("Agricultural Harvest Marketplace")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("Organic Yellow Corn")).toBeInTheDocument()
    })
  })

  test("filters products when search form is submitted", async () => {
    render(<Marketplace />)

    const searchInput = screen.getByPlaceholderText(/search crop/i)
    fireEvent.change(searchInput, { target: { value: "Corn" } })

    const searchBtn = screen.getByRole("button", { name: /search/i })
    fireEvent.click(searchBtn)

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining("search=Corn"))
    })
  })

  test("triggers refetch on filter dropdown and price changes", async () => {
    render(<Marketplace />)

    const countrySelect = screen.getByDisplayValue("All Countries")
    fireEvent.change(countrySelect, { target: { value: "Kenya" } })

    const categorySelect = screen.getByDisplayValue("All Categories")
    fireEvent.change(categorySelect, { target: { value: "Grains" } })

    const sortSelect = screen.getByDisplayValue("Sort: Newest")
    fireEvent.change(sortSelect, { target: { value: "price_asc" } })

    const minPriceInput = screen.getByPlaceholderText("Min ($)")
    fireEvent.change(minPriceInput, { target: { value: "10" } })
    fireEvent.blur(minPriceInput)

    const maxPriceInput = screen.getByPlaceholderText("Max ($)")
    fireEvent.change(maxPriceInput, { target: { value: "500" } })
    fireEvent.blur(maxPriceInput)

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled()
    })
  })
})
