"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Truck, CheckCircle2, Navigation, Clock, User, ShieldCheck } from "lucide-react"

interface Delivery {
  id: string
  driverName: string
  vehiclePlate: string
  facilityName: string
  cargo: string
  weight: number // tons
  eta: string
  status: "dispatched" | "en_route" | "arrived" | "offloaded"
}

export default function WarehouseLogistics() {
  const [session, setSession] = useState<any>(null)
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [success, setSuccess] = useState("")

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        // Load initial inbound logistics manifests from localStorage
        const stored = localStorage.getItem(`af_warehouse_logistics_${session.user.id}`)
        if (stored) {
          setDeliveries(JSON.parse(stored))
        } else {
          const defaultDeliveries: Delivery[] = [
            { id: "del-1", driverName: "Ezekiel Mwangi", vehiclePlate: "KCD 456Y (Actros)", facilityName: "Rift Valley Cold Hub", cargo: "Seed Potatoes", weight: 24, eta: "Today, 14:30 PM", status: "en_route" },
            { id: "del-2", driverName: "Hassan Omar", vehiclePlate: "KBZ 789M (Fuso)", facilityName: "Nakuru Dry Silos", cargo: "White Maize", weight: 15, eta: "Tomorrow, 09:00 AM", status: "dispatched" },
            { id: "del-3", driverName: "Peter Kamau", vehiclePlate: "KDF 123A (Scania)", facilityName: "Rift Valley Cold Hub", cargo: "Fresh Onions", weight: 30, eta: "Arrived at 11:15 AM", status: "arrived" }
          ]
          setDeliveries(defaultDeliveries)
          localStorage.setItem(`af_warehouse_logistics_${session.user.id}`, JSON.stringify(defaultDeliveries))
        }
      }
    })
  }, [])

  const saveDeliveries = (list: Delivery[]) => {
    setDeliveries(list)
    if (session?.user) {
      localStorage.setItem(`af_warehouse_logistics_${session.user.id}`, JSON.stringify(list))
    }
  }

  const handleUpdateStatus = (id: string, newStatus: Delivery["status"]) => {
    const updated = deliveries.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    saveDeliveries(updated)
    setSuccess(`Inbound delivery status updated to ${newStatus}!`)
    setTimeout(() => setSuccess(""), 4000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Truck className="h-8 w-8 text-primary" />
          <span>Inbound Logistics Dispatch Coordinator</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Coordinate crop shipments in-transit from farmers to your storage depots.
        </p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Manifest table/cards */}
      <div className="glass p-8 rounded-xl space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Active Inbound manifests
        </h3>

        {deliveries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No active crop shipments scheduled.</p>
        ) : (
          <div className="space-y-4">
            {deliveries.map((d) => (
              <div key={d.id} className="bg-slate-900/60 p-5 rounded-lg border border-border/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {d.driverName}
                    </span>
                    <span className="bg-slate-950 border border-border text-[9px] text-muted-foreground font-semibold px-2 py-0.5 rounded-full uppercase">
                      {d.vehiclePlate}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      d.status === "offloaded"
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : d.status === "arrived"
                        ? "bg-primary/10 border-primary/20 text-primary animate-pulse"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    }`}>
                      {d.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
                    <div>
                      <span>Destination: </span>
                      <strong className="text-white block mt-0.5">{d.facilityName}</strong>
                    </div>
                    <div>
                      <span>Cargo manifest: </span>
                      <strong className="text-white block mt-0.5">{d.cargo} ({d.weight} Tons)</strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>ETA: <strong>{d.eta}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-border/20 justify-end">
                  {d.status === "en_route" || d.status === "dispatched" ? (
                    <button
                      onClick={() => handleUpdateStatus(d.id, "arrived")}
                      className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      <span>Arrived Gate</span>
                    </button>
                  ) : d.status === "arrived" ? (
                    <button
                      onClick={() => handleUpdateStatus(d.id, "offloaded")}
                      className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Offloaded & Clear</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground uppercase font-bold italic py-1.5">
                      offloaded successful
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
