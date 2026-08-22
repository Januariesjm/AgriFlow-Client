"use client"
import { logger } from "@/lib/logger"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { clientApiGet } from "@/lib/api-client"
import { Order, Product } from "@/lib/types"
import {
  calculateMonthlyRevenue,
  calculateCategoryBreakdown,
  calculateTopProducts,
  calculateTopBuyers,
  calculateInventoryHealth,
} from "@/lib/calculations/analytics"
import { BarChart3, TrendingUp, PieChart, Package } from "lucide-react"

export default function FarmerAnalytics() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [ordersData, productsData] = await Promise.all([
        clientApiGet<{ orders: Order[] }>("orders?role=farmer"),
        clientApiGet<{ products: Product[] }>("products/my"),
      ])

      if (ordersData?.orders) {
        setOrders(ordersData.orders)
      }
      if (productsData?.products) {
        setProducts(productsData.products)
      }
    } catch (err) {
      logger.error("DashboardFarmerAnalytics", "Operation failed", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchAll()
    })
  }, [fetchAll])

  // Computed analytics
  const nonCancelledOrders = orders.filter((o) => o.status !== "cancelled")
  const deliveredOrders = orders.filter((o) => o.status === "delivered")
  const pendingOrders = orders.filter((o) => o.status === "pending")
  const confirmedOrders = orders.filter((o) => o.status === "confirmed")
  const inTransitOrders = orders.filter((o) => o.status === "in_transit")

  const totalRevenue = deliveredOrders.reduce((s, o) => s + (o.total_price || 0), 0)
  const totalOrderValue = nonCancelledOrders.reduce((s, o) => s + (o.total_price || 0), 0)
  const avgOrderValue = nonCancelledOrders.length > 0 ? totalOrderValue / nonCancelledOrders.length : 0
  const conversionRate = orders.length > 0 ? (deliveredOrders.length / orders.length) * 100 : 0

  // Delegated calculations
  const monthlyRevenue = calculateMonthlyRevenue(orders)
  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((m) => m.value), 1)

  const categoryBreakdown = calculateCategoryBreakdown(orders)
  const totalCategoryRevenue = categoryBreakdown.reduce((s, c) => s + c.revenue, 0) || 1

  const categoryColors = [
    "bg-primary", "bg-secondary", "bg-amber-500", "bg-blue-500",
    "bg-pink-500", "bg-cyan-500", "bg-violet-500", "bg-orange-500",
  ]

  const topProducts = calculateTopProducts(orders)
  const topBuyers = calculateTopBuyers(orders)
  const { activeProducts, soldOutProducts, lowStockProducts } = calculateInventoryHealth(products)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          Analytics & Reports
        </h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive performance analytics across your harvest listings, sales, and buyer engagement.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="glass p-5 rounded-xl border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Total Revenue</span>
          <h3 className="text-2xl font-black text-green-400">${totalRevenue.toFixed(2)}</h3>
          <span className="text-[10px] text-muted-foreground">From {deliveredOrders.length} delivered orders</span>
        </div>
        <div className="glass p-5 rounded-xl border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Avg. Order Value</span>
          <h3 className="text-2xl font-black text-white">${avgOrderValue.toFixed(2)}</h3>
          <span className="text-[10px] text-muted-foreground">Across {nonCancelledOrders.length} orders</span>
        </div>
        <div className="glass p-5 rounded-xl border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Fulfillment Rate</span>
          <h3 className="text-2xl font-black text-primary">{conversionRate.toFixed(1)}%</h3>
          <span className="text-[10px] text-muted-foreground">Orders successfully delivered</span>
        </div>
        <div className="glass p-5 rounded-xl border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Active Listings</span>
          <h3 className="text-2xl font-black text-white">{activeProducts.length}</h3>
          <span className="text-[10px] text-muted-foreground">{lowStockProducts.length} low stock alerts</span>
        </div>
      </div>

      {/* Order Pipeline */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Order Pipeline
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 text-center">
            <h4 className="text-3xl font-black text-amber-500">{pendingOrders.length}</h4>
            <span className="text-xs text-muted-foreground font-medium">Pending Review</span>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 text-center">
            <h4 className="text-3xl font-black text-blue-500">{confirmedOrders.length}</h4>
            <span className="text-xs text-muted-foreground font-medium">Confirmed</span>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
            <h4 className="text-3xl font-black text-primary">{inTransitOrders.length}</h4>
            <span className="text-xs text-muted-foreground font-medium">In Transit</span>
          </div>
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 text-center">
            <h4 className="text-3xl font-black text-green-400">{deliveredOrders.length}</h4>
            <span className="text-xs text-muted-foreground font-medium">Delivered</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 glass p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Monthly Revenue Trend
          </h3>
          <div className="flex items-end justify-between gap-3 h-48">
            {monthlyRevenue.map((m, i) => {
              const heightPct = maxMonthlyRevenue > 0 ? (m.value / maxMonthlyRevenue) * 100 : 0
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-bold">
                    {m.value > 0 ? `$${m.value.toFixed(0)}` : "-"}
                  </span>
                  <div className="w-full flex items-end justify-center" style={{ height: "140px" }}>
                    <div
                      className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-primary to-primary/40 transition-all duration-700"
                      style={{ height: `${Math.max(heightPct, 3)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold">{m.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Revenue by Category
          </h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No category data yet.</p>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((c, i) => {
                const pct = (c.revenue / totalCategoryRevenue) * 100
                return (
                  <div key={c.category}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-white">{c.category}</span>
                      <span className="text-xs text-muted-foreground font-bold">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${categoryColors[i % categoryColors.length]} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">${c.revenue.toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-5">Top Selling Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between bg-slate-900/60 rounded-lg p-3.5 border border-border/30">
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                      #{i + 1}
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-white block">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground">{p.orders} order{p.orders !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-secondary">${p.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Buyers */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-5">Top Buyers</h3>
          {topBuyers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No buyer data yet.</p>
          ) : (
            <div className="space-y-3">
              {topBuyers.map((b, i) => (
                <div key={b.name} className="flex items-center justify-between bg-slate-900/60 rounded-lg p-3.5 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                      {b.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-white block">{b.name}</span>
                      <span className="text-[10px] text-muted-foreground">{b.orders} purchase{b.orders !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-secondary">${b.spent.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inventory Health */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-5">Inventory Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-5 text-center">
            <h4 className="text-3xl font-black text-green-400">{activeProducts.length}</h4>
            <span className="text-xs text-muted-foreground font-semibold">Active Listings</span>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-5 text-center">
            <h4 className="text-3xl font-black text-amber-500">{lowStockProducts.length}</h4>
            <span className="text-xs text-muted-foreground font-semibold">Low Stock (≤5 units)</span>
          </div>
          <div className="bg-slate-900/60 border border-border/40 rounded-lg p-5 text-center">
            <h4 className="text-3xl font-black text-muted-foreground">{soldOutProducts.length}</h4>
            <span className="text-xs text-muted-foreground font-semibold">Sold Out</span>
          </div>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm font-bold text-amber-500 mb-3">⚠ Low Stock Alerts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-semibold text-white">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground block">{p.category}</span>
                  </div>
                  <span className="text-sm font-black text-amber-500">{p.quantity} {p.unit}s left</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
