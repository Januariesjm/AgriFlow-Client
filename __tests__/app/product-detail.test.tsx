import React from "react"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import ProductDetail from "@/app/(public)/products/[id]/page"
import { supabase } from "@/lib/supabase"

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "prod-123" }),
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock("@/components/layout/header", () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>
  }
})

jest.mock("@/components/layout/footer", () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>
  }
})

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}))

describe("ProductDetail Component", () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: {
        session: { access_token: "user-session-token" },
      },
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it("fetches and renders product details correctly", async () => {
    const mockProduct = {
      id: "prod-123",
      name: "Fresh Yellow Corn",
      category: "Grains",
      description: "High quality harvested corn.",
      price: 20,
      unit: "kg",
      quantity: 50,
      region: "Nairobi",
      country: "Kenya",
      gps_lat: -1.28,
      gps_lng: 36.81,
      profiles: { full_name: "Farmer John", region: "Nairobi", country: "Kenya" },
    }

    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes("products/prod-123")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ product: mockProduct }),
        })
      }
      return Promise.reject(new Error("Unknown route"))
    })

    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.getByText("Fresh Yellow Corn")).toBeInTheDocument()
      expect(screen.getByText("High quality harvested corn.")).toBeInTheDocument()
      expect(screen.getAllByText("$20").length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/50 kgs/i)).toBeInTheDocument()
    })
  })

  it("calculates transport delivery costs when button is clicked", async () => {
    const mockProduct = {
      id: "prod-123",
      name: "Fresh Yellow Corn",
      category: "Grains",
      price: 20,
      unit: "kg",
      quantity: 50,
      region: "Nairobi",
      country: "Kenya",
      gps_lat: -1.28,
      gps_lng: 36.81,
    }

    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes("products/prod-123")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ product: mockProduct }),
        })
      }
      if (url.includes("transport/cost")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ estimated_cost: 45, distance_km: 120 }),
        })
      }
      return Promise.reject(new Error("Unknown route"))
    })

    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.getByText("Fresh Yellow Corn")).toBeInTheDocument()
    })

    const calcButton = screen.getByText("Estimate Delivery Costs")
    fireEvent.click(calcButton)

    await screen.findByText("Route Distance")

    expect(screen.getByText("120 KM")).toBeInTheDocument()
    expect(screen.getAllByText("$45").length).toBeGreaterThanOrEqual(1)
  })
})
