"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { FileText, Phone, Mail, Check, Truck, CheckCircle2 } from "lucide-react"

export default function FarmerOrders() {
  const [session, setSession] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchOrders(session.access_token)
      }
    })
  }, [])

  const fetchOrders = async (token: string) => {
    try {
      const res = await fetch("http://localhost:4000/api/orders?role=farmer", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        fetchOrders(session.access_token)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Incoming Orders</h1>
        <p className="text-muted-foreground mt-1">
          Review, approve, and track buyer requests for your listed harvest.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p>No orders received yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => (
            <div key={o.id} className="glass p-6 rounded-xl border border-border/40 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border/40 pb-4">
                <div>
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">Order ID</span>
                  <span className="text-xs text-white font-mono">{o.id}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-secondary font-black">${o.total_price}</span>
                  <span className="text-xs font-bold uppercase bg-slate-900 border border-border px-2.5 py-1 rounded-full text-muted-foreground">
                    {o.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Crop & Quantity */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">Crop Details</h4>
                  <p className="text-sm font-semibold text-primary">{o.product?.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Quantity: {o.quantity} {o.product?.unit || "units"} <br />
                    Unit Price: ${o.unit_price}
                  </p>
                </div>

                {/* Buyer contact */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">Buyer Information</h4>
                  <p className="text-sm text-white">{o.buyer?.full_name}</p>
                  <div className="space-y-1 mt-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1.5">
                      <Phone className="h-3 w-3" />
                      <span>{o.buyer?.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Mail className="h-3 w-3" />
                      <span>{o.buyer?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery coordinates/notes */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">Delivery Destination</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Address: {o.delivery_address || "N/A"} <br />
                    Notes: {o.notes || "None"}
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              {o.status === "pending" && (
                <div className="flex space-x-2 pt-4 border-t border-border/40 justify-end">
                  <button
                    onClick={() => updateStatus(o.id, "cancelled")}
                    className="bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer"
                  >
                    Reject Order
                  </button>
                  <button
                    onClick={() => updateStatus(o.id, "confirmed")}
                    className="inline-flex items-center space-x-1 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer shadow"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Approve Order</span>
                  </button>
                </div>
              )}

              {o.status === "confirmed" && (
                <div className="flex space-x-2 pt-4 border-t border-border/40 justify-end">
                  <button
                    onClick={() => updateStatus(o.id, "in_transit")}
                    className="inline-flex items-center space-x-1 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer shadow"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>Mark as Dispatched</span>
                  </button>
                </div>
              )}

              {o.status === "in_transit" && (
                <div className="flex space-x-2 pt-4 border-t border-border/40 justify-end">
                  <button
                    onClick={() => updateStatus(o.id, "delivered")}
                    className="inline-flex items-center space-x-1 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer shadow"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Mark as Delivered</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
