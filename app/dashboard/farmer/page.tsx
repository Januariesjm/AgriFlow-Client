"use client"
import { logger } from "@/lib/logger"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { clientApiGet } from "@/lib/api-client"
import { Profile, Order, Product, Withdrawal } from "@/lib/types"
import { Sprout, TrendingUp, Plus, ArrowRight, Sun, AlertTriangle, Wallet, Shield } from "lucide-react"

export default function FarmerOverview() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, escrow: 0, available: 0 })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  const fetchProfile = useCallback(async () => {
    try {
      const data = await clientApiGet<{ profile: Profile }>("profile")
      if (data?.profile) {
        setProfile(data.profile)
      }
    } catch (err) {
      logger.error("DashboardFarmer", "Operation failed", err)
    }
  }, [])

  const fetchStatsAndOrders = useCallback(async (userId: string) => {
    try {
      const [productsData, ordersData] = await Promise.all([
        clientApiGet<{ products: Product[] }>("products/my"),
        clientApiGet<{ orders: Order[] }>("orders"),
      ])

      let productCount = 0
      let orderCount = 0
      let revenueSum = 0
      let escrowSum = 0
      let availableSum = 0

      if (productsData?.products) {
        productCount = productsData.products.length
      }

      if (ordersData?.orders) {
        const orders = ordersData.orders
        orderCount = orders.length
        setRecentOrders(orders.slice(0, 3))

        // Escrow balance: pending, confirmed, in_transit
        escrowSum = orders
          .filter((o) => ["pending", "confirmed", "in_transit"].includes(o.status))
          .reduce((sum, o) => sum + (o.total_price || 0), 0)

        // Delivered balance (lifetime earnings)
        revenueSum = orders
          .filter((o) => o.status === "delivered")
          .reduce((sum, o) => sum + (o.total_price || 0), 0)

        // Load local withdrawals to compute actual available balance
        const storedWithdrawals = localStorage.getItem(`af_withdrawals_${userId}`)
        let withdrawnAmt = 0
        if (storedWithdrawals) {
          const parsed: Withdrawal[] = JSON.parse(storedWithdrawals)
          withdrawnAmt = parsed.reduce((total, item) => total + Number(item.amount), 0)
        }
        availableSum = Math.max(0, revenueSum - withdrawnAmt)
      }

      setStats({
        products: productCount,
        orders: orderCount,
        revenue: Math.round(revenueSum * 100) / 100,
        escrow: Math.round(escrowSum * 100) / 100,
        available: Math.round(availableSum * 100) / 100,
      })
    } catch (err) {
      logger.error("DashboardFarmer", "Operation failed", err)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile()
        fetchStatsAndOrders(session.user.id)
      }
    })
  }, [fetchProfile, fetchStatsAndOrders])

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            Hello, {profile?.full_name || "Grower"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's the current state of your farm listings and requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/farmer/wallet"
            className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700/80 border border-border text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow"
          >
            <Wallet className="h-4 w-4 text-primary" />
            <span>My Wallet</span>
          </Link>
          <Link
            href="/dashboard/farmer/products"
            className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow"
          >
            <Plus className="h-4 w-4" />
            <span>Add Harvest Listing</span>
          </Link>
        </div>
      </div>

      {/* Weather widget and alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-xl flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Local Agro-Weather</h3>
            <div className="flex items-center space-x-3">
              <Sun className="h-8 w-8 text-amber-500 animate-pulse" />
              <span className="text-2xl font-black text-white">24°C</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ideal planting conditions expected in {profile?.region || "East Africa"} for the next 7 days.
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <span>Humidity: 62%</span> <br />
            <span>Precipitation: 10%</span>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-xl flex items-start space-x-4">
          <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-500">Regional Advisory</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Tomato Blight alerts recorded in neighboring regions. Apply preemptive organic fungicide.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold">Total Listings</span>
              <h3 className="text-2xl font-black text-white mt-1">{stats.products}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sprout className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold">Available Wallet</span>
              <h3 className="text-2xl font-black text-green-400 mt-1">${stats.available}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold">Held in Escrow</span>
              <h3 className="text-2xl font-black text-amber-500 mt-1">${stats.escrow}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold">Gross Revenue</span>
              <h3 className="text-2xl font-black text-secondary mt-1">${stats.revenue}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Recent Incoming Orders</h3>
          <Link href="/dashboard/farmer/orders" className="text-xs text-primary hover:underline flex items-center space-x-1">
            <span>All Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No orders received yet.</p>
        ) : (
          <div className="divide-y divide-border/20 text-sm">
            {recentOrders.map((o) => (
              <div key={o.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-bold text-white">{o.product?.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Buyer: {o.buyer?.full_name} | Qty: {o.quantity} units
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-secondary font-semibold">${o.total_price}</span>
                  <span className="text-xs bg-slate-900 border border-border px-2.5 py-1 rounded-full uppercase font-bold text-muted-foreground">
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
