import { Order, Product } from "@/lib/types"

export interface MonthlyRevenuePoint {
  label: string
  value: number
}

export interface CategoryBreakdownPoint {
  category: string
  revenue: number
}

export interface TopProductPoint {
  name: string
  orders: number
  revenue: number
}

export interface TopBuyerPoint {
  name: string
  orders: number
  spent: number
}

export interface InventoryHealthMetrics {
  activeProducts: Product[]
  soldOutProducts: Product[]
  lowStockProducts: Product[]
}

/**
 * Calculates monthly revenue for delivered orders over a given trailing month count.
 */
export function calculateMonthlyRevenue(orders: Order[] = [], monthsCount = 6): MonthlyRevenuePoint[] {
  const deliveredOrders = orders.filter((o) => o.status === "delivered")
  const monthlyRevenue: MonthlyRevenuePoint[] = []

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const month = d.toLocaleString("default", { month: "short" })
    const year = d.getFullYear()
    const monthNum = d.getMonth()

    const sum = deliveredOrders
      .filter((o) => {
        const od = new Date(o.created_at)
        return od.getMonth() === monthNum && od.getFullYear() === year
      })
      .reduce((s, o) => s + (o.total_price || 0), 0)

    monthlyRevenue.push({ label: month, value: sum })
  }

  return monthlyRevenue
}

/**
 * Aggregates revenue breakdown by crop category for non-cancelled orders.
 */
export function calculateCategoryBreakdown(orders: Order[] = []): CategoryBreakdownPoint[] {
  const nonCancelledOrders = orders.filter((o) => o.status !== "cancelled")
  const categoryMap = new Map<string, number>()

  nonCancelledOrders.forEach((o) => {
    const cat = o.product?.category || "Unknown"
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + (o.total_price || 0))
  })

  return Array.from(categoryMap.entries())
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
}

/**
 * Calculates top selling products sorted by total revenue.
 */
export function calculateTopProducts(orders: Order[] = [], limit = 6): TopProductPoint[] {
  const nonCancelledOrders = orders.filter((o) => o.status !== "cancelled")
  const productSales = new Map<string, TopProductPoint>()

  nonCancelledOrders.forEach((o) => {
    const name = o.product?.name || "Unknown"
    const existing = productSales.get(name) || { name, orders: 0, revenue: 0 }
    existing.orders += 1
    existing.revenue += o.total_price || 0
    productSales.set(name, existing)
  })

  return Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

/**
 * Aggregates buyer spending and total orders sorted by amount spent.
 */
export function calculateTopBuyers(orders: Order[] = [], limit = 5): TopBuyerPoint[] {
  const nonCancelledOrders = orders.filter((o) => o.status !== "cancelled")
  const buyerMap = new Map<string, TopBuyerPoint>()

  nonCancelledOrders.forEach((o) => {
    const name = o.buyer?.full_name || "Anonymous"
    const existing = buyerMap.get(name) || { name, orders: 0, spent: 0 }
    existing.orders += 1
    existing.spent += o.total_price || 0
    buyerMap.set(name, existing)
  })

  return Array.from(buyerMap.values())
    .sort((a, b) => b.spent - a.spent)
    .slice(0, limit)
}

/**
 * Categorizes product inventory into active, sold out, and low stock items.
 */
export function calculateInventoryHealth(products: Product[] = [], lowStockThreshold = 5): InventoryHealthMetrics {
  const activeProducts = products.filter((p) => p.status === "active")
  const soldOutProducts = products.filter((p) => p.status === "sold")
  const lowStockProducts = activeProducts.filter((p) => p.quantity <= lowStockThreshold)

  return {
    activeProducts,
    soldOutProducts,
    lowStockProducts,
  }
}
