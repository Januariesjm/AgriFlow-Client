"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { clientApiGet, clientApiPatch } from "@/lib/api-client"
import { TransportRequest } from "@/lib/types"
import { Truck, Check, MapPin, Navigation } from "lucide-react"

export default function TransporterJobs() {
  const [jobs, setJobs] = useState<TransportRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchJobs = useCallback(async () => {
    try {
      const data = await clientApiGet<{ requests: TransportRequest[] }>("transport/requests")
      if (data?.requests) {
        setJobs(data.requests)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchJobs()
      }
    })
  }, [fetchJobs])

  const acceptJob = async (jobId: string) => {
    try {
      await clientApiPatch(`transport/requests/${jobId}`, { status: "accepted" })
      fetchJobs()
    } catch (err) {
      console.error(err)
    }
  }

  const updateDeliveryStatus = async (jobId: string, newStatus: string) => {
    try {
      await clientApiPatch(`transport/requests/${jobId}`, { status: newStatus })
      fetchJobs()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Available Delivery Jobs</h1>
        <p className="text-muted-foreground mt-1">
          Accept hauling requests from farmers and food processor buyers across the network.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-muted-foreground">
          <Truck className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p>No delivery jobs found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((j) => (
            <div key={j.id} className="glass p-6 rounded-xl border border-border/40 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border/40 pb-4">
                <div>
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">Job ID</span>
                  <span className="text-xs text-white font-mono">{j.id}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {j.estimated_cost && <span className="text-secondary font-black">${j.estimated_cost} payout</span>}
                  <span className="text-xs font-bold uppercase bg-slate-900 border border-border px-2.5 py-1 rounded-full text-muted-foreground">
                    {j.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">Route Details</h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Pickup coordinates: {j.pickup_lat}, {j.pickup_lng}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Navigation className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Delivery coordinates: {j.delivery_lat}, {j.delivery_lng}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-2">Payload Details</h4>
                  <p className="text-xs text-muted-foreground">
                    Total distance: {j.distance_km || "N/A"} KM <br />
                    Est. weight: {j.payload_weight || 1} tons
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              {j.status === "pending" && (
                <div className="flex justify-end pt-4 border-t border-border/40">
                  <button
                    onClick={() => acceptJob(j.id)}
                    className="inline-flex items-center space-x-1.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer shadow"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Accept Shipping Job</span>
                  </button>
                </div>
              )}

              {j.status === "accepted" && (
                <div className="flex justify-end pt-4 border-t border-border/40">
                  <button
                    onClick={() => updateDeliveryStatus(j.id, "in_transit")}
                    className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer shadow"
                  >
                    Mark as Loaded / Departed
                  </button>
                </div>
              )}

              {j.status === "in_transit" && (
                <div className="flex justify-end pt-4 border-t border-border/40">
                  <button
                    onClick={() => updateDeliveryStatus(j.id, "completed")}
                    className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer shadow"
                  >
                    Mark as Delivered / Completed
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
