"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { clientApiGet } from "@/lib/api-client"
import { Order } from "@/lib/types"
import { BarChart3, TrendingUp, PieChart, Package } from "lucide-react"

export default function BuyerAnalytics() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const data = await clientApiGet<{ orders: Order[] }>("orders?role=buyer")
      if (data?.orders) {
        setOrders(data.orders)
      }
    } catch (err) {
      console.error(err)
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

  const totalSpend = nonCancelledOrders.reduce((s, o) => s + (o.total_price || 0), 0)
  const avgOrderPrice = nonCancelledOrders.length > 0 ? totalSpend / nonCancelledOrders.length : 0
  const fulfillmentRate = orders.length > 0 ? (deliveredOrders.length / orders.length) * 100 : 0
  
  // Spend by month (last 6 months)
  const monthlySpend: { label: string; value: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const month = d.toLocaleString("default", { month: "short" })
    const year = d.getFullYear()
    const monthNum = d.getMonth()
    const sum = nonCancelledOrders
      .filter((o) => {
        const od = new Date(o.created_at)
        return od.getMonth() === monthNum && od.getFullYear() === year
      })
      .reduce((s, o) => s + (o.total_price || 0), 0)
    monthlySpend.push({ label: `${month}`, value: sum })
  }
  const maxMonthlySpend = Math.max(...monthlySpend.map((m) => m.value), 1)

  // Spend by category
  const categoryMap = new Map<string, number>()
  nonCancelledOrders.forEach((o) => {
    const cat = o.product?.category || "Other"
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + (o.total_price || 0))
  })
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, spend]) => ({ category, spend }))
    .sort((a, b) => b.spend - a.spend)
  const totalCategorySpend = categoryBreakdown.reduce((s, c) => s + c.spend, 0) || 1

  const categoryColors = [
    "bg-primary", "bg-secondary", "bg-amber-500", "bg-blue-500",
    "bg-pink-500", "bg-cyan-500", "bg-violet-500", "bg-orange-500",
  ]

  // Top supplying farmers
  const supplierSales = new Map<string, { name: string; orders: number; revenue: number }>()
  nonCancelledOrders.forEach((o) => {
    const name = o.farmer?.full_name || "Unknown Farmer"
    const existing = supplierSales.get(name) || { name, orders: 0, revenue: 0 }
    existing.orders += 1
    existing.revenue += o.total_price || 0
    supplierSales.set(name, existing)
  })
  const topSuppliers = Array.from(supplierSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Sourcing by origin country
  const countryMap = new Map<string, { country: string; orders: number; spend: number }>()
  nonCancelledOrders.forEach((o) => {
    const country = o.farmer?.country || "Kenya"
    const existing = countryMap.get(country) || { country, orders: 0, spend: 0 }
    existing.orders += 1
    existing.spend += o.total_price || 0
    countryMap.set(country, existing)
  })
  const countryBreakdown = Array.from(countryMap.values())
    .sort((a, b) => b.spend - a.spend)

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
          Procurement Analytics & Spend Reports
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor sourcing volume, track contract spend, analyze category distribution, and evaluate supplier fulfillment rates.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="glass p-5 rounded-xl border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Total Procurement Spend</span>
          <h3 className="text-2xl font-black text-white">${totalSpend.toFixed(2)}</h3>
          <span className="text-[10px] text-muted-foreground">Across {nonCancelledOrders.length} active buys</span>
        </div>
        <div className="glass p-5 rounded-xl border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Average Deal Value</span>
          <h3 className="text-2xl font-black text-white">${avgOrderPrice.toFixed(2)}</h3>
          <span className="text-[10px] text-muted-foreground">Per purchase order contract</span>
        </div>
        <div className="glass p-5 rounded-xl border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Fulfillment Success</span>
          <h3 className="text-2xl font-black text-primary">{fulfillmentRate.toFixed(1)}%</h3>
          <span className="text-[10px] text-muted-foreground">Delivered vs cancelled ratio</span>
        </div>
        <div className="glass p-5 rounded-xl border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Active Suppliers</span>
          <h3 className="text-2xl font-black text-white">{topSuppliers.length}</h3>
          <span className="text-[10px] text-muted-foreground">Farming partners currently sourcing from</span>
        </div>
      </div>

      {/* Order Pipeline */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Procurement Sourcing pipeline
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 text-center">
            <h4 className="text-3xl font-black text-amber-500">{pendingOrders.length}</h4>
            <span className="text-xs text-muted-foreground font-medium">Awaiting Farmer Confirm</span>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 text-center">
            <h4 className="text-3xl font-black text-blue-500">{confirmedOrders.length}</h4>
            <span className="text-xs text-muted-foreground font-medium">Confirmed & Ready</span>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
            <h4 className="text-3xl font-black text-primary">{inTransitOrders.length}</h4>
            <span className="text-xs text-muted-foreground font-medium">In Transit / En Route</span>
          </div>
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 text-center">
            <h4 className="text-3xl font-black text-green-400">{deliveredOrders.length}</h4>
            <span className="text-xs text-muted-foreground font-medium">Delivered & Closed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Spend Chart */}
        <div className="lg:col-span-2 glass p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Monthly Procurement Spend Trend
          </h3>
          <div className="flex items-end justify-between gap-3 h-48">
            {monthlySpend.map((m, i) => {
              const heightPct = maxMonthlySpend > 0 ? (m.value / maxMonthlySpend) * 100 : 0
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
            Spend by Commodity Category
          </h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No procurement data recorded.</p>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((c, i) => {
                const pct = (c.spend / totalCategorySpend) * 100
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
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">${c.spend.toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Suppliers */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-5">Key Supplying Farming Partners</h3>
          {topSuppliers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No supplier statistics available.</p>
          ) : (
            <div className="space-y-3">
              {topSuppliers.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between bg-slate-900/60 rounded-lg p-3.5 border border-border/30">
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                      #{i + 1}
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-white block">{s.name}</span>
                      <span className="text-[10px] text-muted-foreground">{s.orders} contract{s.orders !== 1 ? "s" : ""} fulfilled</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-secondary">${s.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sourcing by Origin Country */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-5">Cross-Border Sourcing Distribution</h3>
          {countryBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No regional sourcing recorded.</p>
          ) : (
            <div className="space-y-4">
              {countryBreakdown.map((item) => {
                const pct = (item.spend / totalSpend) * 100
                return (
                  <div key={item.country} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-white">
                      <span>{item.country}</span>
                      <span className="text-secondary font-bold">${item.spend.toFixed(2)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground block">{item.orders} purchases sourced</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
