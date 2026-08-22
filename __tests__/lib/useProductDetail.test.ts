import { renderHook, act } from "@testing-library/react"
import { useProductDetail } from "@/lib/hooks/useProductDetail"
import { api } from "@/lib/api"

jest.mock("@/lib/api")

describe("useProductDetail Hook", () => {
  const mockProduct = {
    id: "prod-123",
    name: "Yellow Maize",
    category: "Grains",
    price: 450,
    unit: "Bag",
    quantity: 100,
    gps_lat: -0.5142,
    gps_lng: 35.2698,
    country: "Kenya",
    region: "Eldoret",
    status: "active",
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("fetches product details on fetchProduct call", async () => {
    ;(api.get as jest.Mock).mockResolvedValue({ product: mockProduct })

    const { result } = renderHook(() => useProductDetail("prod-123"))

    await act(async () => {
      await result.current.fetchProduct()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.product).toEqual(mockProduct)
  })

  test("calculates transport cost via api", async () => {
    ;(api.get as jest.Mock)
      .mockResolvedValueOnce({ product: mockProduct })
      .mockResolvedValueOnce({ estimated_cost: 1500, distance_km: 120.5 })

    const { result } = renderHook(() => useProductDetail("prod-123"))

    await act(async () => {
      await result.current.fetchProduct()
    })

    await act(async () => {
      await result.current.calculateTransport()
    })

    expect(result.current.transportCost).toBe(1500)
    expect(result.current.distance).toBe(120.5)
  })

  test("returns redirectLogin when placing order without session", async () => {
    ;(api.get as jest.Mock).mockResolvedValue({ product: mockProduct })

    const { result } = renderHook(() => useProductDetail("prod-123"))

    await act(async () => {
      await result.current.fetchProduct()
    })

    let res
    await act(async () => {
      res = await result.current.handlePlaceOrder(null)
    })

    expect(res).toEqual({ redirectLogin: true })
  })

  test("places order successfully with session", async () => {
    ;(api.get as jest.Mock).mockResolvedValue({ product: mockProduct })
    ;(api.post as jest.Mock).mockResolvedValue({ success: true })

    const mockSession = { access_token: "token_abc", user: { id: "buyer-1" } } as any

    const { result } = renderHook(() => useProductDetail("prod-123"))

    await act(async () => {
      await result.current.fetchProduct()
    })

    let res
    await act(async () => {
      res = await result.current.handlePlaceOrder(mockSession)
    })

    expect(res).toEqual({ success: true })
    expect(result.current.orderSuccess).toBe(true)
  })
})
