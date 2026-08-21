import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import FarmerAnalytics from "@/app/dashboard/farmer/analytics/page"
import { clientApiGet } from "@/lib/api-client"
import { supabase } from "@/lib/supabase"

jest.mock("@/lib/api-client")
jest.mock("@/lib/supabase")

describe("FarmerAnalytics Page Component", () => {
  const mockOrders = [
    {
      id: "ord-1",
      buyer_id: "buyer-1",
      product_id: "prod-1",
      quantity: 5,
      total_price: 25000,
      status: "delivered",
      created_at: "2026-08-01T10:00:00Z",
    },
    {
      id: "ord-2",
      buyer_id: "buyer-2",
      product_id: "prod-2",
      quantity: 2,
      total_price: 10000,
      status: "pending",
      created_at: "2026-08-05T10:00:00Z",
    },
  ]

  const mockProducts = [
    {
      id: "prod-1",
      farmer_id: "f-1",
      name: "Maize Harvest",
      category: "Grains",
      quantity: 100,
      unit: "tons",
      price: 5000,
      currency: "KES",
      country: "Kenya",
      region: "Eldoret",
      gps_lat: 0,
      gps_lng: 0,
      quality_grade: "A",
      status: "active",
      created_at: "2026-08-01T00:00:00Z",
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: "f-1" } } },
    })
    ;(clientApiGet as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("orders")) return Promise.resolve({ orders: mockOrders })
      if (url.includes("products")) return Promise.resolve({ products: mockProducts })
      return Promise.resolve({})
    })
  })

  test("loads and renders analytics dashboard header and calculated KPIs", async () => {
    render(<FarmerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText(/analytics & reports/i)).toBeInTheDocument()
    })

    expect(screen.getByText("Total Revenue")).toBeInTheDocument()
    expect(screen.getByText("Avg. Order Value")).toBeInTheDocument()
  })

  test("renders empty analytics state gracefully when no orders exist", async () => {
    ;(clientApiGet as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("orders")) return Promise.resolve({ orders: [] })
      if (url.includes("products")) return Promise.resolve({ products: [] })
      return Promise.resolve({})
    })

    render(<FarmerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText(/analytics & reports/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/fulfillment rate/i)).toBeInTheDocument()
    expect(screen.getAllByText(/active listings/i)[0]).toBeInTheDocument()
  })
})
