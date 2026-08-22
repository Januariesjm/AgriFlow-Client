import { renderHook, act, waitFor } from "@testing-library/react"
import { useFarmerLogistics } from "@/lib/hooks/useFarmerLogistics"
import { useSession } from "@/lib/hooks/useSession"
import { clientApiGet, clientApiPost } from "@/lib/api-client"

jest.mock("@/lib/hooks/useSession")
jest.mock("@/lib/api-client")

const ORDERS = [
  {
    id: "ord-1",
    status: "confirmed",
    quantity: 20,
    delivery_lat: -1.3005,
    delivery_lng: 36.8822,
    product: { farm_id: "farm-1", name: "Wheat", unit: "Bag" },
  },
  {
    id: "ord-2",
    status: "pending",
    quantity: 5,
    product: { farm_id: "farm-1", name: "Beans", unit: "Bag" },
  },
]

const FARMS = [{ id: "farm-1", name: "Green Valley", region: "Uasin Gishu", gps_lat: -0.5142, gps_lng: 35.2698 }]
const VEHICLES = [{ id: "veh-1", type: "Flatbed", price_per_km: 4.5, capacity_tons: 15, plate_number: "KDD 123X" }]
const REQUESTS = [
  {
    id: "req-1",
    order_id: "ord-0",
    status: "accepted",
    pickup_lat: -0.5142,
    pickup_lng: 35.2698,
    delivery_lat: -1.3005,
    delivery_lng: 36.8822,
    created_at: "2026-08-15T09:00:00Z",
  },
]

function mockApiSuccess() {
  ;(clientApiGet as jest.Mock).mockImplementation((url: string) => {
    if (url.includes("orders")) return Promise.resolve({ orders: ORDERS })
    if (url.includes("farms")) return Promise.resolve({ farms: FARMS })
    if (url.includes("vehicles")) return Promise.resolve({ vehicles: VEHICLES })
    if (url.includes("requests")) return Promise.resolve({ requests: REQUESTS })
    return Promise.resolve({})
  })
}

describe("useFarmerLogistics", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue({
      session: { user: { id: "farmer-1" } },
      loading: false,
    })
    ;(clientApiPost as jest.Mock).mockResolvedValue({ success: true })
  })

  test("loads all logistics data sets and preselects the first transport request", async () => {
    mockApiSuccess()
    const { result } = renderHook(() => useFarmerLogistics())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.orders).toHaveLength(2)
    expect(result.current.farms).toHaveLength(1)
    expect(result.current.vehicles).toHaveLength(1)
    expect(result.current.transportRequests).toHaveLength(1)
    expect(result.current.selectedRequest?.id).toBe("req-1")
  })

  test("exposes only confirmed orders without existing requests as bookable", async () => {
    mockApiSuccess()
    const { result } = renderHook(() => useFarmerLogistics())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.bookableOrders.map((o) => o.id)).toEqual(["ord-1"])
  })

  test("surfaces a load error when any dashboard fetch fails", async () => {
    ;(clientApiGet as jest.Mock).mockRejectedValue(new Error("gateway down"))
    const { result } = renderHook(() => useFarmerLogistics())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe("Failed to fetch logistics data.")
  })

  test("bookTransport posts pickup and delivery coordinates for the order's farm", async () => {
    mockApiSuccess()
    const { result } = renderHook(() => useFarmerLogistics())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let booked = false
    await act(async () => {
      booked = await result.current.bookTransport("ord-1")
    })

    expect(booked).toBe(true)
    expect(clientApiPost).toHaveBeenCalledWith("transport/request", {
      order_id: "ord-1",
      pickup_lat: -0.5142,
      pickup_lng: 35.2698,
      delivery_lat: -1.3005,
      delivery_lng: 36.8822,
    })
    expect(result.current.success).toMatch(/published to nearby transporters/i)
  })

  test("bookTransport reports an error for an unknown order id", async () => {
    mockApiSuccess()
    const { result } = renderHook(() => useFarmerLogistics())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let booked = true
    await act(async () => {
      booked = await result.current.bookTransport("missing-order")
    })

    expect(booked).toBe(false)
    expect(result.current.error).toBe("Order not found")
    expect(clientApiPost).not.toHaveBeenCalled()
  })

  test("bookTransport surfaces API failures without clearing local data", async () => {
    mockApiSuccess()
    ;(clientApiPost as jest.Mock).mockRejectedValue(new Error("dispatch rejected"))
    const { result } = renderHook(() => useFarmerLogistics())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let booked = true
    await act(async () => {
      booked = await result.current.bookTransport("ord-1")
    })

    expect(booked).toBe(false)
    expect(result.current.error).toBe("dispatch rejected")
    expect(result.current.orders).toHaveLength(2)
  })
})
