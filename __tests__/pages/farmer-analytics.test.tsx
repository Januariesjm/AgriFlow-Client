import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import FarmerAnalytics from "@/app/dashboard/farmer/analytics/page"
import { clientApiGet } from "@/lib/api-client"
import { supabase } from "@/lib/supabase"

jest.mock("@/lib/api-client")
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}))

describe("FarmerAnalytics Page Component", () => {
  const mockOrders = [
    {
      id: "ord-1",
      total_price: 1200,
      status: "delivered",
      created_at: new Date().toISOString(),
      product: { name: "Yellow Corn", category: "Grains" },
      buyer: { full_name: "John Buyer" },
    },
    {
      id: "ord-2",
      total_price: 800,
      status: "confirmed",
      created_at: new Date().toISOString(),
      product: { name: "Red Beans", category: "Legumes" },
      buyer: { full_name: "Alice Smith" },
    },
    {
      id: "ord-3",
      total_price: 500,
      status: "pending",
      created_at: new Date().toISOString(),
      product: { name: "Yellow Corn", category: "Grains" },
      buyer: { full_name: "John Buyer" },
    },
  ]

  const mockProducts = [
    { id: "p-1", name: "Yellow Corn", category: "Grains", quantity: 50, unit: "Bag", status: "active" },
    { id: "p-2", name: "Red Beans", category: "Legumes", quantity: 3, unit: "Bag", status: "active" },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: "farmer-1" } } },
    })
    ;(clientApiGet as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("orders")) {
        return Promise.resolve({ orders: mockOrders })
      }
      if (url.includes("products")) {
        return Promise.resolve({ products: mockProducts })
      }
      return Promise.resolve({})
    })
  })

  test("renders analytics heading and computes KPIs correctly", async () => {
    render(<FarmerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText("Analytics & Reports")).toBeInTheDocument()
      expect(screen.getByText("Total Revenue")).toBeInTheDocument()
      expect(screen.getByText("$1200.00")).toBeInTheDocument()
      expect(screen.getByText("Avg. Order Value")).toBeInTheDocument()
      expect(screen.getByText("Fulfillment Rate")).toBeInTheDocument()
    })
  })

  test("renders order pipeline statuses", async () => {
    render(<FarmerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText("Order Pipeline")).toBeInTheDocument()
      expect(screen.getByText("Pending Review")).toBeInTheDocument()
      expect(screen.getByText("Delivered")).toBeInTheDocument()
    })
  })

  test("renders category breakdown and inventory health alerts", async () => {
    render(<FarmerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText("Revenue by Category")).toBeInTheDocument()
      expect(screen.getByText("Inventory Health")).toBeInTheDocument()
      expect(screen.getByText("⚠ Low Stock Alerts")).toBeInTheDocument()
      expect(screen.getByText("3 Bags left")).toBeInTheDocument()
    })
  })
})
