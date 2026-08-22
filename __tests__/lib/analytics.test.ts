import {
  calculateMonthlyRevenue,
  calculateCategoryBreakdown,
  calculateTopProducts,
  calculateTopBuyers,
  calculateInventoryHealth,
} from "@/lib/calculations/analytics"
import { Order, Product } from "@/lib/types"

describe("Analytics Calculations Library", () => {
  const sampleOrders: Order[] = [
    {
      id: "ord-1",
      buyer_id: "usr-1",
      farmer_id: "usr-2",
      product_id: "prod-1",
      quantity: 10,
      unit_price: 50,
      total_price: 500,
      transport_cost: 20,
      status: "delivered",
      created_at: new Date().toISOString(),
      product: { name: "Yellow Maize", category: "Grains", unit: "kg" },
      buyer: { email: "buyer1@example.com", full_name: "Alice Smith" },
    },
    {
      id: "ord-2",
      buyer_id: "usr-1",
      farmer_id: "usr-2",
      product_id: "prod-2",
      quantity: 5,
      unit_price: 60,
      total_price: 300,
      transport_cost: 15,
      status: "delivered",
      created_at: new Date().toISOString(),
      product: { name: "Red Beans", category: "Legumes", unit: "kg" },
      buyer: { email: "buyer1@example.com", full_name: "Alice Smith" },
    },
    {
      id: "ord-3",
      buyer_id: "usr-2",
      farmer_id: "usr-2",
      product_id: "prod-1",
      quantity: 2,
      unit_price: 50,
      total_price: 100,
      transport_cost: 5,
      status: "confirmed",
      created_at: new Date().toISOString(),
      product: { name: "Yellow Maize", category: "Grains", unit: "kg" },
      buyer: { email: "buyer2@example.com", full_name: "Bob Jones" },
    },
    {
      id: "ord-4",
      buyer_id: "usr-3",
      farmer_id: "usr-2",
      product_id: "prod-3",
      quantity: 1,
      unit_price: 200,
      total_price: 200,
      transport_cost: 0,
      status: "cancelled",
      created_at: new Date().toISOString(),
      product: { name: "Coffee Beans", category: "Cash Crops", unit: "kg" },
    },
  ]

  const sampleProducts: Product[] = [
    {
      id: "p1",
      farmer_id: "s1",
      name: "Maize",
      category: "Grains",
      price: 50,
      quantity: 20,
      unit: "kg",
      currency: "USD",
      country: "Kenya",
      region: "Eldoret",
      gps_lat: 0,
      gps_lng: 0,
      quality_grade: "A",
      status: "active",
      created_at: "",
    },
    {
      id: "p2",
      farmer_id: "s1",
      name: "Beans",
      category: "Legumes",
      price: 40,
      quantity: 3,
      unit: "kg",
      currency: "USD",
      country: "Kenya",
      region: "Eldoret",
      gps_lat: 0,
      gps_lng: 0,
      quality_grade: "B",
      status: "active",
      created_at: "",
    },
    {
      id: "p3",
      farmer_id: "s1",
      name: "Wheat",
      category: "Grains",
      price: 60,
      quantity: 0,
      unit: "kg",
      currency: "USD",
      country: "Kenya",
      region: "Eldoret",
      gps_lat: 0,
      gps_lng: 0,
      quality_grade: "C",
      status: "sold",
      created_at: "",
    },
  ]

  describe("calculateMonthlyRevenue", () => {
    test("returns array of trailing months for empty orders", () => {
      const result = calculateMonthlyRevenue([])
      expect(result).toHaveLength(6)
      expect(result.every((r) => r.value === 0)).toBe(true)
    })

    test("aggregates total price of delivered orders for current month", () => {
      const result = calculateMonthlyRevenue(sampleOrders)
      expect(result).toHaveLength(6)
      const currentMonth = result[result.length - 1]
      expect(currentMonth.value).toBe(800)
    })

    test("respects custom months count parameter", () => {
      const result = calculateMonthlyRevenue(sampleOrders, 3)
      expect(result).toHaveLength(3)
    })
  })

  describe("calculateCategoryBreakdown", () => {
    test("returns empty array for empty orders", () => {
      expect(calculateCategoryBreakdown([])).toEqual([])
    })

    test("aggregates non-cancelled orders by category and sorts descending", () => {
      const breakdown = calculateCategoryBreakdown(sampleOrders)
      expect(breakdown).toHaveLength(2)
      expect(breakdown[0]).toEqual({ category: "Grains", revenue: 600 })
      expect(breakdown[1]).toEqual({ category: "Legumes", revenue: 300 })
    })

    test("handles orders with missing product category cleanly", () => {
      const incompleteOrder: Order = {
        id: "ord-99",
        buyer_id: "b",
        farmer_id: "f",
        product_id: "p",
        quantity: 1,
        unit_price: 150,
        total_price: 150,
        transport_cost: 0,
        status: "confirmed",
        created_at: new Date().toISOString(),
      }
      const breakdown = calculateCategoryBreakdown([incompleteOrder])
      expect(breakdown).toEqual([{ category: "Unknown", revenue: 150 }])
    })
  })

  describe("calculateTopProducts", () => {
    test("returns empty array for empty orders", () => {
      expect(calculateTopProducts([])).toEqual([])
    })

    test("aggregates sales volume and revenue per product", () => {
      const topProds = calculateTopProducts(sampleOrders)
      expect(topProds).toHaveLength(2)
      expect(topProds[0]).toEqual({ name: "Yellow Maize", orders: 2, revenue: 600 })
      expect(topProds[1]).toEqual({ name: "Red Beans", orders: 1, revenue: 300 })
    })

    test("respects limit parameter", () => {
      const topProds = calculateTopProducts(sampleOrders, 1)
      expect(topProds).toHaveLength(1)
      expect(topProds[0].name).toBe("Yellow Maize")
    })
  })

  describe("calculateTopBuyers", () => {
    test("returns empty array for empty orders", () => {
      expect(calculateTopBuyers([])).toEqual([])
    })

    test("aggregates total spending per buyer", () => {
      const topBuyers = calculateTopBuyers(sampleOrders)
      expect(topBuyers).toHaveLength(2)
      expect(topBuyers[0]).toEqual({ name: "Alice Smith", orders: 2, spent: 800 })
      expect(topBuyers[1]).toEqual({ name: "Bob Jones", orders: 1, spent: 100 })
    })

    test("falls back to Anonymous when buyer name is missing", () => {
      const orderNoBuyer: Order = {
        id: "o",
        buyer_id: "b",
        farmer_id: "f",
        product_id: "p",
        quantity: 1,
        unit_price: 75,
        total_price: 75,
        transport_cost: 0,
        status: "delivered",
        created_at: new Date().toISOString(),
      }
      const topBuyers = calculateTopBuyers([orderNoBuyer])
      expect(topBuyers).toEqual([{ name: "Anonymous", orders: 1, spent: 75 }])
    })
  })

  describe("calculateInventoryHealth", () => {
    test("returns empty lists for empty products array", () => {
      const health = calculateInventoryHealth([])
      expect(health.activeProducts).toEqual([])
      expect(health.soldOutProducts).toEqual([])
      expect(health.lowStockProducts).toEqual([])
    })

    test("correctly categorizes active, sold out, and low stock products", () => {
      const health = calculateInventoryHealth(sampleProducts, 5)
      expect(health.activeProducts).toHaveLength(2)
      expect(health.soldOutProducts).toHaveLength(1)
      expect(health.lowStockProducts).toHaveLength(1)
      expect(health.lowStockProducts[0].name).toBe("Beans")
    })

    test("allows custom low stock threshold", () => {
      const health = calculateInventoryHealth(sampleProducts, 25)
      expect(health.lowStockProducts).toHaveLength(2)
    })
  })
})
