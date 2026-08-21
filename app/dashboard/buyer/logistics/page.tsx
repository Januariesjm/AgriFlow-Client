"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { clientApiGet } from "@/lib/api-client"
import { Order, Vehicle, TransportRequest } from "@/lib/types"
import { Truck, CheckCircle2, AlertCircle, RefreshCw, Compass } from "lucide-react"

export default function BuyerLogistics() {
  const [orders, setOrders] = useState<Order[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchLogisticsData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [ordersData, vehiclesData, requestsData] = await Promise.all([
        clientApiGet<{ orders: Order[] }>("orders?role=buyer"),
        clientApiGet<{ vehicles: Vehicle[] }>("transport/vehicles"),
        clientApiGet<{ requests: TransportRequest[] }>("transport/requests"),
      ])

      if (ordersData?.orders) {
        setOrders(ordersData.orders)
      }
      if (vehiclesData?.vehicles) {
        setVehicles(vehiclesData.vehicles)
      }
      if (requestsData?.requests) {
        setTransportRequests(requestsData.requests)
      }
    } catch (err) {
      console.error(err)
      setError("Failed to fetch logistics and carrier tracking details.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchLogisticsData()
      }
    })
  }, [fetchLogisticsData])

  // Filter transport requests relevant to the buyer's orders
  const buyerOrderIds = new Set(orders.map((o) => o.id))
  const inboundRequests = transportRequests.filter((r) => r.order_id && buyerOrderIds.has(r.order_id))

  const activeDeliveries = inboundRequests.filter((r) => ["accepted", "in_transit"].includes(r.status)).length
  const pendingPickup = inboundRequests.filter((r) => r.status === "pending").length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Truck className="h-8 w-8 text-primary" />
          <span>Inbound Logistics & Carrier Tracker</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor incoming crop shipments, coordinate transit routes, and track regional carriers in real-time.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-xl border border-primary/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-primary font-bold uppercase tracking-wider block">In Transit</span>
              <h3 className="text-3xl font-black text-white mt-1">{activeDeliveries}</h3>
              <p className="text-xs text-muted-foreground mt-1">Shipments currently moving on regional corridors.</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-amber-500/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-amber-500 font-bold uppercase tracking-wider block">Awaiting Dispatch</span>
              <h3 className="text-3xl font-black text-white mt-1">{pendingPickup}</h3>
              <p className="text-xs text-muted-foreground mt-1">Booked loads awaiting vehicle dispatch.</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Compass className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-border/40 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">Registered Carriers</span>
              <h3 className="text-3xl font-black text-white mt-1">{vehicles.length}</h3>
              <p className="text-xs text-muted-foreground mt-1">Verified partner drivers in database.</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Carriers */}
        <div className="glass p-8 rounded-xl lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2.5">
              <Truck className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold text-white">Logistics Partners</h3>
            </div>
            <span className="text-xs text-muted-foreground">{vehicles.length} online</span>
          </div>

          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            These partner carriers provide freight forwarding services. Sourcing rates are based on mileage.
          </p>

          {vehicles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No regional carriers listed.</p>
          ) : (
            <div className="space-y-4">
              {vehicles.map((v) => (
                <div key={v.id} className="bg-slate-900/60 p-4 rounded-lg border border-border/40 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white uppercase">{v.type}</span>
                    <span className="text-xs text-secondary font-black">${v.price_per_km}/km</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Capacity: {v.capacity_tons} Tons | Plate: {v.plate_number}</p>
                  <div className="text-[10px] text-muted-foreground pt-1.5 border-t border-border/20 flex justify-between">
                    <span>Driver: {v.profiles?.full_name || "Partner Driver"}</span>
                    <span>Contact: {v.profiles?.phone || "N/A"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Inbound Shipments */}
        <div className="glass p-8 rounded-xl lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              Active Inbound Manifests
            </h3>
            <button
              onClick={() => fetchLogisticsData()}
              className="text-xs text-muted-foreground hover:text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Reload Manifests</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
            </div>
          ) : inboundRequests.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-sm text-muted-foreground">No inbound shipments booked for your purchases yet.</p>
              <p className="text-xs text-muted-foreground/60">Sellers book transporters once they confirm crop orders.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-muted-foreground border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                    <th className="py-3 px-4">Dispatch ID</th>
                    <th className="py-3 px-4">Commodity</th>
                    <th className="py-3 px-4">Distance</th>
                    <th className="py-3 px-4">Landed Freight</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {inboundRequests.map((r) => {
                    const order = orders.find((o) => o.id === r.order_id)
                    return (
                      <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs text-white">DSP-{r.id.substring(0, 8).toUpperCase()}</td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-white">
                          {order?.product?.name || "Crop"}
                          <span className="text-[10px] text-muted-foreground block">Qty: {order?.quantity} {order?.product?.unit}s</span>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          {r.distance_km ? `${r.distance_km.toFixed(1)} km` : "Calculating..."}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-secondary">
                          ${r.estimated_cost?.toFixed(2) || "0.00"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            r.status === "completed" 
                              ? "bg-green-500/10 border-green-500/20 text-green-400" 
                              : r.status === "accepted" || r.status === "in_transit"
                              ? "bg-primary/10 border-primary/20 text-primary"
                              : "bg-slate-950 border-border text-muted-foreground"
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <button
                            onClick={() => {
                              alert(`Shipment Details:\nDispatch ID: ${r.id}\nStatus: ${r.status}\nEstimated Cost: $${r.estimated_cost?.toFixed(2) || "0.00"}\nAssigned Carrier: ${r.transporter_id ? `Carrier #${r.transporter_id.substring(0, 8)}` : "Awaiting Carrier Pickup"}\nPickup coordinates: [${r.pickup_lat}, ${r.pickup_lng}]\nDelivery coordinates: [${r.delivery_lat}, ${r.delivery_lng}]`)
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold px-2.5 py-1 rounded transition-all cursor-pointer"
                          >
                            Track Load
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
