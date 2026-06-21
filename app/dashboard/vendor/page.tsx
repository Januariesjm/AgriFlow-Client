"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { ShoppingBag, TrendingUp, DollarSign, Package, AlertCircle, ArrowRight, Star, Plus } from "lucide-react"

interface Storefront {
  name: string
  location: string
  status: string
}

interface Product {
  id: string
  name: string
  category: string
  price: number
  quantity: number
}

interface Order {
  id: string
  farmerName: string
  productName: string
  quantity: number
  totalPrice: number
  status: string
  createdAt: string
}

export default function VendorOverview() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [storefront, setStorefront] = useState<Storefront>({
    name: "My Agro-Input Shop",
    location: "Nairobi Agro-Hub",
    status: "open"
  })
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.access_token)
        loadLocalData(session.user.id)
      }
    })
  }, [])

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch("http://localhost:4000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const loadLocalData = (userId: string) => {
    setLoading(true)
    try {
      // Load storefront
      const storedStore = localStorage.getItem(`af_vendor_store_${userId}`)
      if (storedStore) setStorefront(JSON.parse(storedStore))

      // Load products
      const storedProducts = localStorage.getItem(`af_vendor_products_${userId}`)
      let prodList: Product[] = []
      if (storedProducts) {
        prodList = JSON.parse(storedProducts)
      } else {
        prodList = [
          { id: "p1", name: "Hybrid Maize Seeds (Pan 53)", category: "Seeds", price: 12.5, quantity: 45 },
          { id: "p2", name: "NPK 15:15:15 Fertilizer", category: "Fertilizers", price: 34.0, quantity: 8 },
          { id: "p3", name: "Glyphosate Weedkiller 1L", category: "Agro-Chemicals", price: 8.9, quantity: 15 },
          { id: "p4", name: "Premium Hand Hoe (Jembe)", category: "Farm Tools", price: 6.5, quantity: 3 }
        ]
        localStorage.setItem(`af_vendor_products_${userId}`, JSON.stringify(prodList))
      }
      setProducts(prodList)

      // Load orders
      const storedOrders = localStorage.getItem(`af_vendor_orders_${userId}`)
      let orderList: Order[] = []
      if (storedOrders) {
        orderList = JSON.parse(storedOrders)
      } else {
        orderList = [
          { id: "o1", farmerName: "John Kamau", productName: "Hybrid Maize Seeds (Pan 53)", quantity: 5, totalPrice: 62.5, status: "pending", createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: "o2", farmerName: "Mary Wambui", productName: "NPK 15:15:15 Fertilizer", quantity: 2, totalPrice: 68.0, status: "confirmed", createdAt: new Date(Date.now() - 7200000).toISOString() },
          { id: "o3", farmerName: "David Ochieng", productName: "Glyphosate Weedkiller 1L", quantity: 10, totalPrice: 89.0, status: "delivered", createdAt: new Date(Date.now() - 86400000).toISOString() }
        ]
        localStorage.setItem(`af_vendor_orders_${userId}`, JSON.stringify(orderList))
      }
      setOrders(orderList)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Analytics calculations
  const totalSales = orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.totalPrice, 0)
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const lowStockProducts = products.filter((p) => p.quantity < 10)
  const totalProducts = products.length

  return (
    <div className="space-y-8">
      {/* Header / Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome back, <span className="text-primary">{profile?.full_name || "Input Vendor"}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Store: <strong className="text-white">{storefront.name}</strong> ({storefront.location}) · Status: <span className="text-green-400 font-bold uppercase">{storefront.status}</span>
          </p>
        </div>

        <Link
          href="/dashboard/vendor/products"
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm transition-all shadow self-start cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Input Item</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-xl border border-primary/20 relative overflow-hidden">
          <span className="text-xs text-primary font-bold uppercase tracking-wider block">Delivered Sales</span>
          <h3 className="text-3xl font-black text-white mt-1">${totalSales.toFixed(2)}</h3>
          <p className="text-xs text-muted-foreground mt-1">Cleared earnings in wallet.</p>
          <div className="absolute top-4 right-4 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-amber-500/20 relative overflow-hidden">
          <span className="text-xs text-amber-500 font-bold uppercase tracking-wider block">Pending Orders</span>
          <h3 className="text-3xl font-black text-white mt-1">{pendingOrders}</h3>
          <p className="text-xs text-muted-foreground mt-1">Awaiting shop confirmation.</p>
          <div className="absolute top-4 right-4 h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-amber-500" />
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-red-500/20 relative overflow-hidden">
          <span className="text-xs text-red-500 font-bold uppercase tracking-wider block">Low Stock Alerts</span>
          <h3 className="text-3xl font-black text-red-400 mt-1">{lowStockProducts.length}</h3>
          <p className="text-xs text-muted-foreground mt-1">Items below threshold level.</p>
          <div className="absolute top-4 right-4 h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-border/40 relative overflow-hidden">
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">Listed Input Catalog</span>
          <h3 className="text-3xl font-black text-white mt-1">{totalProducts}</h3>
          <p className="text-xs text-muted-foreground mt-1">Active agricultural items.</p>
          <div className="absolute top-4 right-4 h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent incoming orders */}
        <div className="lg:col-span-2 glass p-6 rounded-xl space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Recent Incoming Sourcing Orders</h3>
            <Link
              href="/dashboard/vendor/orders"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-6">Loading orders...</div>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No farmer orders received yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/30 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Farmer</th>
                    <th className="py-2.5 px-3">Input Product</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {orders.slice(0, 4).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs text-white">ORD-{o.id.toUpperCase()}</td>
                      <td className="py-3 px-3 text-xs text-white font-medium">{o.farmerName}</td>
                      <td className="py-3 px-3 text-xs">
                        {o.productName}
                        <span className="text-[10px] text-muted-foreground block">Qty: {o.quantity} units</span>
                      </td>
                      <td className="py-3 px-3 text-xs font-bold text-secondary">${o.totalPrice.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          o.status === "delivered"
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : o.status === "pending"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            : "bg-primary/10 border-primary/20 text-primary"
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low stock alerts & actions */}
        <div className="glass p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Stock Restock Alerts</h3>
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">All listed inventory levels are healthy.</p>
            ) : (
              <div className="space-y-3.5">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex justify-between items-center bg-slate-900/60 p-3 rounded-lg border border-red-500/20">
                    <div>
                      <span className="text-xs font-bold text-white block truncate max-w-[150px]">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground">{p.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-red-400 block">{p.quantity} units</span>
                      <span className="text-[9px] text-muted-foreground">low stock</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border/20 mt-4 space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/dashboard/vendor/products" className="bg-slate-900 hover:bg-slate-800 border border-border/40 text-white font-bold p-2.5 rounded-lg text-center transition-colors">
                List Inputs
              </Link>
              <Link href="/dashboard/vendor/storefront" className="bg-slate-900 hover:bg-slate-800 border border-border/40 text-white font-bold p-2.5 rounded-lg text-center transition-colors">
                Edit Store
              </Link>
              <Link href="/dashboard/vendor/wallet" className="bg-slate-900 hover:bg-slate-800 border border-border/40 text-white font-bold p-2.5 rounded-lg text-center transition-colors col-span-2">
                Withdraw Wallets Payout
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sourcing tips */}
      <div className="glass rounded-xl p-6 border border-primary/10">
        <h3 className="text-base font-bold text-white mb-2">Input Sourcing Cycle Tip</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Farmer demand for Hybrid Maize and NPK Fertilizer spikes dramatically during the East African long rain preparation periods (Feb-Mar) and short rain periods (Aug-Sep). Ensure your storefront catalog lists plenty of stock 3 weeks in advance of these planting windows to maximize agricultural trade volumes.
        </p>
      </div>
    </div>
  )
}
