"use client"
import { logger } from "@/lib/logger"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { clientApiGet, clientApiPost } from "@/lib/api-client"
import { Order, Farm, Vehicle, TransportRequest } from "@/lib/types"
import { Truck, Navigation, CheckCircle2, AlertCircle, RefreshCw, Plus } from "lucide-react"
import RouteMap from "@/components/maps/RouteMap"

export default function FarmerLogistics() {
  const [orders, setOrders] = useState<Order[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null)

  // Form state
  const [selectedOrderId, setSelectedOrderId] = useState("")

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [ordersData, farmsData, vehiclesData, requestsData] = await Promise.all([
        clientApiGet<{ orders: Order[] }>("orders?role=farmer"),
        clientApiGet<{ farms: Farm[] }>("farms"),
        clientApiGet<{ vehicles: Vehicle[] }>("transport/vehicles"),
        clientApiGet<{ requests: TransportRequest[] }>("transport/requests"),
      ])

      if (ordersData?.orders) {
        setOrders(ordersData.orders)
      }
      if (farmsData?.farms) {
        setFarms(farmsData.farms)
      }
      if (vehiclesData?.vehicles) {
        setVehicles(vehiclesData.vehicles)
      }
      if (requestsData?.requests) {
        setTransportRequests(requestsData.requests)
        if (requestsData.requests.length > 0) {
          setSelectedRequest(requestsData.requests[0])
        }
      }
    } catch (err) {
      logger.error("DashboardFarmerLogistics", "Operation failed", err)
      setError("Failed to fetch logistics data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchDashboardData()
      }
    })
  }, [fetchDashboardData])

  const bookableOrders = orders.filter((o) => {
    const isConfirmed = o.status === "confirmed"
    const alreadyRequested = transportRequests.some((r) => r.order_id === o.id)
    return isConfirmed && !alreadyRequested
  })

  const handleBookTransport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrderId) return
    setError("")
    setSuccess("")
    setSubmitting(true)

    try {
      const order = orders.find((o) => o.id === selectedOrderId)
      if (!order) throw new Error("Order not found")

      const farm = farms.find((f) => f.id === order.product?.farm_id) || farms[0]
      const pickupLat = farm ? farm.gps_lat : -1.2921
      const pickupLng = farm ? farm.gps_lng : 36.8219

      const deliveryLat = order.delivery_lat || -1.3005
      const deliveryLng = order.delivery_lng || 36.8822

      await clientApiPost("transport/request", {
        order_id: selectedOrderId,
        pickup_lat: Number(pickupLat),
        pickup_lng: Number(pickupLng),
        delivery_lat: Number(deliveryLat),
        delivery_lng: Number(deliveryLng),
      })

      setSuccess("Transport dispatch request published to nearby transporters!")
      setSelectedOrderId("")
      fetchDashboardData()
      setTimeout(() => setSuccess(""), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create transport booking request"
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Truck className="h-8 w-8 text-primary" />
          <span>Logistics & Delivery Coordinator</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Coordinate logistics, book transporters, and monitor active crop dispatches in real-time.
        </p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Book Transporter Form */}
        <div className="glass p-8 rounded-xl lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-6">
              <Plus className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold text-white">Request Transport</h3>
            </div>

            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Book a regional transporter to move crops from your farm to the buyer. Estimated costs are computed automatically based on distance.
            </p>

            {farms.length === 0 ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-xs leading-relaxed mb-4">
                Please register a farm under <strong>My Farm</strong> first to establish pickup coordinates.
              </div>
            ) : bookableOrders.length === 0 ? (
              <div className="p-4 bg-slate-900 border border-border/40 rounded-lg text-xs text-muted-foreground text-center">
                No confirmed orders awaiting dispatch booking. Approve pending orders first.
              </div>
            ) : (
              <form onSubmit={handleBookTransport} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Select Confirmed Order</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Select Order --</option>
                    {bookableOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.product?.name} ({o.quantity} {o.product?.unit}s) - Buyer: {o.buyer?.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedOrderId && (() => {
                  const o = orders.find((ord) => ord.id === selectedOrderId)
                  const f = farms.find((farm) => farm.id === o?.product?.farm_id) || farms[0]
                  return (
                    <div className="p-4 bg-slate-900 border border-border/40 rounded-lg space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pickup Location:</span>
                        <span className="text-white font-medium">{f.name} ({f.region})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destination:</span>
                        <span className="text-white font-medium max-w-[180px] text-right truncate" title={o?.delivery_address}>
                          {o?.delivery_address || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Product Quantity:</span>
                        <span className="text-white font-medium">{o?.quantity} {o?.product?.unit}s</span>
                      </div>
                    </div>
                  )
                })()}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3 rounded-lg text-sm transition-all cursor-pointer shadow disabled:opacity-50"
                >
                  {submitting ? "Booking Dispatch..." : "Book Transport Request"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Vehicles Directory */}
        <div className="glass p-8 rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2.5">
              <Truck className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold text-white">Available Regional Transporters</h3>
            </div>
            <span className="text-xs text-muted-foreground">{vehicles.length} available</span>
          </div>

          {vehicles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No active logistics vehicles registered in your area.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map((v) => (
                <div key={v.id} className="bg-slate-900/60 p-4 rounded-lg border border-border/40 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-white uppercase">{v.type}</span>
                      <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                        ${v.price_per_km}/km
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Capacity: {v.capacity_tons} Tons | Plate: {v.plate_number}</p>
                  </div>

                  <div className="border-t border-border/30 pt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Driver: {v.profiles?.full_name || "Regional Driver"}</span>
                    <span>Contact: {v.profiles?.phone || "N/A"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedRequest && (
        <div className="glass rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            <span>Active Dispatch Route: TRP-{selectedRequest.id.substring(0, 8).toUpperCase()}</span>
          </h3>
          <RouteMap
            originLat={selectedRequest.pickup_lat}
            originLng={selectedRequest.pickup_lng}
            destLat={selectedRequest.delivery_lat}
            destLng={selectedRequest.delivery_lng}
            originLabel="Pickup Farm"
            destLabel="Delivery Depot"
            height="350px"
          />
        </div>
      )}

      {/* Booking History / Status */}
      <div className="glass rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Active Dispatch Logs</h3>
          <button
            onClick={() => fetchDashboardData()}
            className="text-xs text-muted-foreground hover:text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reload Logs</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
          </div>
        ) : transportRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No logistics bookings placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Est. Cost</th>
                  <th className="py-3 px-4">Transporter Info</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {transportRequests.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRequest(r)}
                    className={`hover:bg-slate-900/60 cursor-pointer transition-colors ${selectedRequest?.id === r.id ? "bg-slate-900/40 border-l-2 border-primary" : ""}`}
                  >
                    <td className="py-3.5 px-4 font-mono text-xs text-white">TRP-{r.id.substring(0, 8).toUpperCase()}</td>
                    <td className="py-3.5 px-4 text-xs font-semibold">{r.distance_km ? `${r.distance_km.toFixed(1)} km` : "Calculating..."}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-secondary">${r.estimated_cost?.toFixed(2) || "0.00"}</td>
                    <td className="py-3.5 px-4 text-xs">
                      {r.transporter_id ? (
                        <div>
                          <span className="text-white block font-medium">Assigned Transporter</span>
                          <span className="text-[10px] text-muted-foreground">ID: {r.transporter_id.substring(0, 8)}</span>
                        </div>
                      ) : (
                        <span className="text-amber-500 font-bold text-[10px] uppercase">Awaiting Carrier Pickup</span>
                      )}
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
                    <td className="py-3.5 px-4 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
