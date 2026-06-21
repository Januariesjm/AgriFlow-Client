"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { FileText, CheckCircle2, Truck, XCircle, ArrowRight, Star, RefreshCw } from "lucide-react"

interface Order {
  id: string
  farmerName: string
  farmerPhone: string
  productName: string
  quantity: number
  totalPrice: number
  status: "pending" | "confirmed" | "dispatched" | "delivered" | "cancelled"
  deliveryAddress: string
  createdAt: string
  notes?: string
}

export default function VendorOrders() {
  const [session, setSession] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<string>("all")

  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        // Load orders
        const stored = localStorage.getItem(`af_vendor_orders_${session.user.id}`)
        if (stored) {
          setOrders(JSON.parse(stored))
        } else {
          const defaultOrders: Order[] = [
            { id: "o1", farmerName: "John Kamau", farmerPhone: "+254 711 222333", productName: "Hybrid Maize Seeds (Pan 53)", quantity: 5, totalPrice: 62.5, status: "pending", deliveryAddress: "Farm Block A, Nakuru Bypass", createdAt: new Date(Date.now() - 3600000).toISOString(), notes: "Please dispatch early morning." },
            { id: "o2", farmerName: "Mary Wambui", farmerPhone: "+254 733 444555", productName: "NPK 15:15:15 Fertilizer", quantity: 2, totalPrice: 68.0, status: "confirmed", deliveryAddress: "Green Hills Cooperative, Kiambu", createdAt: new Date(Date.now() - 7200000).toISOString() },
            { id: "o3", farmerName: "David Ochieng", farmerPhone: "+254 755 666777", productName: "Glyphosate Weedkiller 1L", quantity: 10, totalPrice: 89.0, status: "delivered", deliveryAddress: "Kisumu Central Depot", createdAt: new Date(Date.now() - 86400000).toISOString() }
          ]
          setOrders(defaultOrders)
          localStorage.setItem(`af_vendor_orders_${session.user.id}`, JSON.stringify(defaultOrders))
        }
      }
    })
  }, [])

  const saveOrders = (list: Order[]) => {
    setOrders(list)
    if (session?.user) {
      localStorage.setItem(`af_vendor_orders_${session.user.id}`, JSON.stringify(list))
    }
  }

  const handleUpdateStatus = (id: string, newStatus: Order["status"]) => {
    const updated = orders.map((o) => {
      if (o.id === id) {
        // Handle escrow credit update to ledger if status changed to delivered
        if (newStatus === "delivered") {
          addEarningsToWallet(o.totalPrice)
        }
        return { ...o, status: newStatus }
      }
      return o
    })
    saveOrders(updated)
    setSuccess(`Order status updated to ${newStatus}!`)
    setTimeout(() => setSuccess(""), 4000)
  }

  const addEarningsToWallet = (amount: number) => {
    if (!session?.user) return
    const walletKey = `af_vendor_wallet_${session.user.id}`
    const stored = localStorage.getItem(walletKey)
    let balance = 250.0
    let lifetime = 1540.0
    let ledgers = []

    if (stored) {
      const parsed = JSON.parse(stored)
      balance = parsed.balance ?? 250.0
      lifetime = parsed.lifetime ?? 1540.0
      ledgers = parsed.ledgers ?? []
    }

    const newBalance = balance + amount
    const newLifetime = lifetime + amount
    const newLedger = {
      id: `led-${Date.now()}`,
      type: "credit",
      amount,
      desc: `Cleared earnings for order payouts`,
      date: new Date().toISOString()
    }

    localStorage.setItem(
      walletKey,
      JSON.stringify({
        balance: newBalance,
        lifetime: newLifetime,
        ledgers: [newLedger, ...ledgers]
      })
    )
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === "all") return true
    return o.status === filter
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <span>Sales & Incoming Orders</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Review, confirm, and update shipping logs for inputs ordered by local farmers.
        </p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Tabs Filter */}
      <div className="flex flex-wrap gap-2 border-b border-border/20 pb-4">
        {[
          { label: "All Orders", value: "all" },
          { label: "Pending", value: "pending" },
          { label: "Confirmed", value: "confirmed" },
          { label: "Dispatched", value: "dispatched" },
          { label: "Delivered", value: "delivered" },
          { label: "Cancelled", value: "cancelled" }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === tab.value
                ? "bg-primary text-primary-foreground shadow"
                : "bg-slate-900 border border-border text-muted-foreground hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="glass p-12 text-center text-sm text-muted-foreground">
          No orders found matching this status filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => (
            <div key={o.id} className="glass p-6 rounded-xl border border-border/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-3.5 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-sm font-mono text-white font-bold">ORD-{o.id.toUpperCase()}</span>
                  <span className="text-xs text-muted-foreground">· {new Date(o.createdAt).toLocaleString()}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    o.status === "delivered"
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : o.status === "pending"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      : o.status === "cancelled"
                      ? "bg-red-500/10 border-red-500/20 text-red-500"
                      : "bg-primary/10 border-primary/20 text-primary"
                  }`}>
                    {o.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Farmer details</span>
                    <span className="text-white font-semibold block">{o.farmerName}</span>
                    <span className="text-[11px] text-muted-foreground">{o.farmerPhone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Sourced Product</span>
                    <span className="text-white font-semibold block">{o.productName}</span>
                    <span className="text-[11px] text-muted-foreground">Quantity: {o.quantity} units</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Billing Total</span>
                    <span className="text-secondary font-extrabold text-sm">${o.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-xs bg-slate-950 p-2.5 rounded-lg border border-border/20 text-muted-foreground">
                  <div>Delivery Location: <strong className="text-white">{o.deliveryAddress}</strong></div>
                  {o.notes && <div className="mt-1">Notes: <span className="italic">"{o.notes}"</span></div>}
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap md:flex-col gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-border/20">
                {o.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(o.id, "confirmed")}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Confirm Order</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(o.id, "cancelled")}
                      className="bg-slate-900 border border-border/40 hover:bg-slate-800 text-red-400 text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Cancel</span>
                    </button>
                  </>
                )}

                {o.status === "confirmed" && (
                  <button
                    onClick={() => handleUpdateStatus(o.id, "dispatched")}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>Dispatch Cargo</span>
                  </button>
                )}

                {o.status === "dispatched" && (
                  <button
                    onClick={() => handleUpdateStatus(o.id, "delivered")}
                    className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Deliver & Settle</span>
                  </button>
                )}

                {(o.status === "delivered" || o.status === "cancelled") && (
                  <span className="text-[10px] text-muted-foreground uppercase font-bold italic py-2">
                    transaction finalized
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
