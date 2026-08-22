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
      seller_id: "usr-2",
      product_id: "prod-1",
      quantity: 10,
      total_price: 500,
      status: "delivered",
      created_at: new Date().toISOString(),
      product: { id: "prod-1", name: "Yellow Maize", category: "Grains", price_per_unit: 50, quantity: 100, unit: "kg", seller_id: "usr-2", status: "active", created_at: "" },
      buyer: { id: "usr-1", email: "buyer1@example.com", full_name: "Alice Smith", role: "buyer", created_at: "" },
    },
    {
      id: "ord-2",
      buyer_id: "usr-1",
      seller_id: "usr-2",
      product_id: "prod-2",
      quantity: 5,
      total_price: 300,
      status: "delivered",
      created_at: new Date().toISOString(),
      product: { id: "prod-2", name: "Red Beans", category: "Legumes", price_per_unit: 60, quantity: 50, unit: "kg", seller_id: "usr-2", status: "active", created_at: "" },
      buyer: { id: "usr-1", email: "buyer1@example.com", full_name: "Alice Smith", role: "buyer", created_at: "" },
    },
    {
      id: "ord-3",
      buyer_id: "usr-2",
      seller_id: "usr-2",
      product_id: "prod-1",
      quantity: 2,
      total_price: 100,
      status: "confirmed",
      created_at: new Date().toISOString(),
      product: { id: "prod-1", name: "Yellow Maize", category: "Grains", price_per_unit: 50, quantity: 100, unit: "kg", seller_id: "usr-2", status: "active", created_at: "" },
      buyer: { id: "usr-2", email: "buyer2@example.com", full_name: "Bob Jones", role: "buyer", created_at: "" },
    },
    {
      id: "ord-4",
      buyer_id: "usr-3",
      seller_id: "usr-2",
      product_id: "prod-3",
      quantity: 1,
      total_price: 200,
      status: "cancelled",
      created_at: new Date().toISOString(),
      product: { id: "prod-3", name: "Coffee Beans", category: "Cash Crops", price_per_unit: 200, quantity: 20, unit: "kg", seller_id: "usr-2", status: "active", created_at: "" },
    },
  ]

  const sampleProducts: Product[] = [
    { id: "p1", name: "Maize", category: "Grains", price_per_unit: 50, quantity: 20, unit: "kg", seller_id: "s1", status: "active", created_at: "" },
    { id: "p2", name: "Beans", category: "Legumes", price_per_unit: 40, quantity: 3, unit: "kg", seller_id: "s1", status: "active", created_at: "" },
    { id: "p3", name: "Wheat", category: "Grains", price_per_unit: 60, quantity: 0, unit: "kg", seller_id: "s1", status: "sold", created_at: "" },
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
        seller_id: "s",
        product_id: "p",
        quantity: 1,
        total_price: 150,
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
        seller_id: "s",
        product_id: "p",
        quantity: 1,
        total_price: 75,
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
