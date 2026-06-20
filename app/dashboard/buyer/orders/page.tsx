"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { FileText, Phone, Mail, Truck, Compass, CheckCircle } from "lucide-react"

export default function BuyerOrders() {
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
      const res = await fetch("http://localhost:4000/api/orders?role=buyer", {
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

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return
    try {
      const res = await fetch(`http://localhost:4000/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
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
        <h1 className="text-3xl font-extrabold text-white">My Purchase Orders</h1>
        <p className="text-muted-foreground mt-1">
          Track shipment, status updates, and invoice receipts for active deals.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p>No orders placed yet.</p>
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
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">Crop Details</h4>
                  <p className="text-sm font-semibold text-primary">{o.product?.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Quantity: {o.quantity} {o.product?.unit || "units"} <br />
                    Unit Price: ${o.unit_price}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-2">Farmer Information</h4>
                  <p className="text-sm text-white">{o.farmer?.full_name}</p>
                  <div className="space-y-1 mt-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1.5">
                      <Phone className="h-3 w-3" />
                      <span>{o.farmer?.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Mail className="h-3 w-3" />
                      <span>{o.farmer?.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-2">Delivery Details</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Destination: {o.delivery_address || "Coordinates"} <br />
                    Notes: {o.notes || "None"}
                  </p>
                </div>
              </div>

              {o.status === "pending" && (
                <div className="flex justify-end pt-4 border-t border-border/40">
                  <button
                    onClick={() => cancelOrder(o.id)}
                    className="bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer"
                  >
                    Cancel Order
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
