"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { clientApiGet } from "@/lib/api-client"
import { Profile, Order } from "@/lib/types"
import { ShoppingBag, TrendingUp, Compass, ArrowRight } from "lucide-react"

export default function BuyerOverview() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({ orders: 0, pending: 0, spent: 0 })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  const fetchProfile = useCallback(async () => {
    try {
      const data = await clientApiGet<{ profile: Profile }>("profile")
      if (data?.profile) {
        setProfile(data.profile)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const fetchStatsAndOrders = useCallback(async () => {
    try {
      const data = await clientApiGet<{ orders: Order[] }>("orders?role=buyer")
      if (data?.orders) {
        const orders = data.orders
        setRecentOrders(orders.slice(0, 3))

        const pendingOrders = orders.filter((o) => o.status === "pending").length
        const totalSpent = orders
          .filter((o) => o.status !== "cancelled")
          .reduce((sum, o) => sum + (o.total_price || 0), 0)

        setStats({
          orders: orders.length,
          pending: pendingOrders,
          spent: Math.round(totalSpent * 100) / 100,
        })
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile()
        fetchStatsAndOrders()
      }
    })
  }, [fetchProfile, fetchStatsAndOrders])

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            Hello, {profile?.full_name || "Agribusiness Buyer"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse regional agricultural commodities, compare landed rates, and manage logistics.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/buyer/products"
            className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Browse Commodities</span>
          </Link>
          <Link
            href="/dashboard/buyer/prices"
            className="inline-flex items-center space-x-2 border border-border bg-slate-900/40 hover:bg-slate-900/80 font-semibold px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
          >
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Compare Prices</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold">Total Purchases</span>
              <h3 className="text-2xl font-black text-white mt-1">{stats.orders}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold">Pending Approval</span>
              <h3 className="text-2xl font-black text-white mt-1">{stats.pending}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Compass className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold">Total Spent</span>
              <h3 className="text-2xl font-black text-secondary mt-1">${stats.spent}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Purchases */}
      <div className="glass rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Recent Purchase Orders</h3>
          <Link href="/dashboard/buyer/orders" className="text-xs text-primary hover:underline flex items-center space-x-1">
            <span>All Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No orders placed yet.</p>
        ) : (
          <div className="divide-y divide-border/20 text-sm">
            {recentOrders.map((o) => (
              <div key={o.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-bold text-white">{o.product?.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Farmer: {o.farmer?.full_name} | Qty: {o.quantity} units
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
