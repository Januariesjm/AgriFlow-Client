import React from "react"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import FarmerLogistics from "@/app/dashboard/farmer/logistics/page"
import { clientApiGet, clientApiPost } from "@/lib/api-client"
import { supabase } from "@/lib/supabase"

jest.mock("@/lib/api-client")
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}))
jest.mock("@/components/maps/RouteMap", () => {
  return function DummyRouteMap() {
    return <div data-testid="route-map">Route Map Component</div>
  }
})

describe("FarmerLogistics Page Component", () => {
  const mockOrders = [
    {
      id: "ord-101",
      status: "confirmed",
      quantity: 20,
      delivery_lat: -1.3005,
      delivery_lng: 36.8822,
      delivery_address: "Nairobi Industrial Area Depot",
      product: { farm_id: "farm-1", name: "Grade 1 Wheat", unit: "Bag" },
      buyer: { full_name: "GrainCorp Ltd" },
    },
  ]

  const mockFarms = [
    { id: "farm-1", name: "Green Valley Farm", region: "Uasin Gishu", gps_lat: -0.5142, gps_lng: 35.2698 },
  ]

  const mockVehicles = [
    {
      id: "veh-1",
      type: "Flatbed Truck",
      price_per_km: 4.5,
      capacity_tons: 15,
      plate_number: "KDD 123X",
      profiles: { full_name: "Peter Driver", phone: "+254711998877" },
    },
  ]

  const mockRequests = [
    {
      id: "req-99999999",
      order_id: "ord-99",
      distance_km: 145.2,
      estimated_cost: 653.4,
      status: "accepted",
      pickup_lat: -0.5142,
      pickup_lng: 35.2698,
      delivery_lat: -1.3005,
      delivery_lng: 36.8822,
      created_at: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: "farmer-1" } } },
    })
    ;(clientApiGet as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("orders")) return Promise.resolve({ orders: mockOrders })
      if (url.includes("farms")) return Promise.resolve({ farms: mockFarms })
      if (url.includes("vehicles")) return Promise.resolve({ vehicles: mockVehicles })
      if (url.includes("requests")) return Promise.resolve({ requests: mockRequests })
      return Promise.resolve({})
    })
    ;(clientApiPost as jest.Mock).mockResolvedValue({ success: true })
  })

  test("renders logistics coordinator heading and vehicles list", async () => {
    render(<FarmerLogistics />)

    expect(screen.getByText("Logistics & Delivery Coordinator")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("Available Regional Transporters")).toBeInTheDocument()
      expect(screen.getByText("Flatbed Truck")).toBeInTheDocument()
      expect(screen.getByText("$4.5/km")).toBeInTheDocument()
    })
  })

  test("submits transport dispatch booking request", async () => {
    render(<FarmerLogistics />)

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Grade 1 Wheat/i })).toBeInTheDocument()
    })

    const select = screen.getByRole("combobox")
    fireEvent.change(select, { target: { value: "ord-101" } })

    const submitBtn = screen.getByRole("button", { name: /Book Transport Request/i })

    await act(async () => {
      fireEvent.click(submitBtn)
    })

    await waitFor(() => {
      expect(clientApiPost).toHaveBeenCalledWith("transport/request", {
        order_id: "ord-101",
        pickup_lat: -0.5142,
        pickup_lng: 35.2698,
        delivery_lat: -1.3005,
        delivery_lng: 36.8822,
      })
      expect(screen.getByText("Transport dispatch request published to nearby transporters!")).toBeInTheDocument()
    })
  })
})
