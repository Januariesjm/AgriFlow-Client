import React from "react"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import MyProducts from "@/app/dashboard/farmer/products/page"
import { useSession } from "@/lib/hooks/useSession"
import { clientApiGet, clientApiPost, clientApiDelete } from "@/lib/api-client"

jest.mock("@/lib/hooks/useSession")
jest.mock("@/lib/api-client")

const FARM = {
  id: "farm-1",
  farmer_id: "farmer-9",
  name: "Green Acres",
  location: "Nakuru",
  country: "Kenya",
  region: "Nakuru",
  gps_lat: -0.3031,
  gps_lng: 36.08,
  created_at: "2026-08-01T08:00:00Z",
}

const PRODUCT = {
  id: "prod-1",
  farmer_id: "farmer-9",
  farm_id: "farm-1",
  name: "Beans",
  category: "Legumes",
  quantity: 4,
  unit: "ton",
  price: 300,
  currency: "USD",
  country: "Kenya",
  region: "Nakuru",
  gps_lat: -0.3031,
  gps_lng: 36.08,
  quality_grade: "B",
  status: "active",
  created_at: "2026-08-10T08:00:00Z",
}

describe("Farmer MyProducts Page", () => {
  const mockSession = {
    session: { user: { id: "farmer-9", email: "farmer@agriflow.com" } },
    loading: false,
  }

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue(mockSession)
    ;(clientApiGet as jest.Mock).mockImplementation((path: string) => {
      if (path === "products/my") return Promise.resolve({ products: [PRODUCT] })
      if (path === "farms") return Promise.resolve({ farms: [FARM] })
      return Promise.resolve({})
    })
    ;(clientApiPost as jest.Mock).mockResolvedValue({
      ...PRODUCT,
      id: "prod-2",
      name: "Maize",
      category: "Grains",
      quantity: 10,
      price: 220,
      quality_grade: "A",
    })
    ;(clientApiDelete as jest.Mock).mockResolvedValue({ success: true })
  })

  test("renders products fetched through the shared resource hook", async () => {
    render(<MyProducts />)

    expect(screen.getByText("Harvest Listings")).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText("Beans")).toBeInTheDocument()
    })
    expect(clientApiGet).toHaveBeenCalledWith("products/my")
  })

  test("publishes a new listing after schema validation passes", async () => {
    render(<MyProducts />)

    await waitFor(() => expect(screen.getByText("Beans")).toBeInTheDocument())

    fireEvent.click(screen.getByRole("button", { name: /Add Crop Offer/ }))
    fireEvent.change(screen.getByPlaceholderText("10"), { target: { value: "10" } })
    fireEvent.change(screen.getByPlaceholderText("220"), { target: { value: "220" } })

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Publish to Marketplace/ }))
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(clientApiPost).toHaveBeenCalledWith(
        "products",
        expect.objectContaining({ name: "Maize", quantity: 10, price: 220, country: "Kenya" })
      )
      expect(screen.getByText("Maize")).toBeInTheDocument()
    })
  })

  test("blocks submission and surfaces schema issues for invalid quantity", async () => {
    render(<MyProducts />)

    await waitFor(() => expect(screen.getByText("Beans")).toBeInTheDocument())

    fireEvent.click(screen.getByRole("button", { name: /Add Crop Offer/ }))
    fireEvent.change(screen.getByPlaceholderText("10"), { target: { value: "-3" } })
    fireEvent.change(screen.getByPlaceholderText("220"), { target: { value: "220" } })

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Publish to Marketplace/ }))
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(screen.getByText(/Quantity must be a positive number\./)).toBeInTheDocument()
    })
    expect(clientApiPost).not.toHaveBeenCalled()
  })

  test("removes a listing when deletion is confirmed", async () => {
    window.confirm = jest.fn().mockReturnValue(true)
    render(<MyProducts />)

    await waitFor(() => expect(screen.getByText("Beans")).toBeInTheDocument())

    await act(async () => {
      fireEvent.click(screen.getByTitle("Remove Listing"))
      await Promise.resolve()
    })

    expect(clientApiDelete).toHaveBeenCalledWith("products/prod-1")
    await waitFor(() => {
      expect(screen.queryByText("Beans")).not.toBeInTheDocument()
    })
  })
})
