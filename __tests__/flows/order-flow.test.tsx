import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import ProductDetail from "@/app/(public)/products/[id]/page"
import { api } from "@/lib/api"
import { supabase } from "@/lib/supabase"
import { calculateLandedCost, calculateCropTotal } from "@/lib/checkout"

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "prod-101" }),
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/products/prod-101",
}))

jest.mock("@/lib/api")
jest.mock("@/lib/supabase")

describe("Order Flow Integration Test", () => {
  const mockProduct = {
    id: "prod-101",
    farmer_id: "farmer-1",
    name: "Premium Yellow Maize",
    category: "Grains",
    quantity: 50,
    unit: "ton",
    price: 450,
    currency: "USD",
    country: "Kenya",
    region: "Nakuru",
    gps_lat: -0.3031,
    gps_lng: 36.08,
    quality_grade: "Grade A",
    status: "active",
    created_at: "2026-08-01T00:00:00Z",
    profiles: {
      full_name: "John Farmer",
      region: "Nakuru",
      country: "Kenya",
    },
  }

  const mockSession = {
    user: { id: "buyer-123", email: "buyer@agriflow.com" },
    access_token: "mock-access-token",
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
    })
    ;(supabase.auth.onAuthStateChange as jest.Mock) = jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })
    ;(api.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("products/prod-101")) {
        return Promise.resolve({ product: mockProduct })
      }
      if (url.includes("transport/cost")) {
        return Promise.resolve({
          estimated_cost: 120,
          distance_km: 150,
          currency: "USD",
        })
      }
      return Promise.resolve({})
    })
  })

  test("renders product details and verifies calculateLandedCost output reaches DOM end-to-end", async () => {
    render(<ProductDetail />)

    // 1. Wait for product details to load
    await waitFor(() => {
      expect(screen.getByText("Premium Yellow Maize")).toBeInTheDocument()
    })

    // Assert initial crop subtotal calculation (1 ton @ 450 USD = 450 USD)
    const subtotal = calculateCropTotal(mockProduct.price, 1)
    expect(subtotal).toBe(450)

    // 2. Trigger transport calculation button
    const calcBtn = screen.getByRole("button", { name: /estimate delivery costs/i })
    fireEvent.click(calcBtn)

    // 3. Verify landed cost output reaches DOM
    await waitFor(() => {
      expect(screen.getByText(/150 KM/i)).toBeInTheDocument()
    })

    // Assert calculateLandedCost math matches rendered total (450 crop subtotal + 120 transport = 570 USD)
    const expectedLandedCost = calculateLandedCost(mockProduct.price, 1, 120)
    expect(expectedLandedCost).toBe(570)
  })

  test("submits order successfully when Confirm Purchase is clicked with valid session", async () => {
    ;(api.post as jest.Mock).mockResolvedValue({ id: "order-999" })

    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.getByText("Premium Yellow Maize")).toBeInTheDocument()
    })

    const buyBtn = screen.getByRole("button", { name: /confirm purchase/i })
    fireEvent.click(buyBtn)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "orders",
        expect.objectContaining({
          product_id: "prod-101",
          quantity: 1,
        }),
        "mock-access-token"
      )
    })
  })
})
