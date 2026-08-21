"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { clientApiGet, clientApiPost } from "@/lib/api-client"
import { Profile, Vehicle } from "@/lib/types"
import { Truck, Plus, CheckCircle } from "lucide-react"

export default function TransporterOverview() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  // Form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [type, setType] = useState("truck")
  const [capacity, setCapacity] = useState("")
  const [plateNumber, setPlateNumber] = useState("")
  const [pricePerKm, setPricePerKm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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

  const fetchVehicles = useCallback(async () => {
    try {
      const data = await clientApiGet<{ vehicles: Vehicle[] }>("transport/vehicles")
      if (data?.vehicles) {
        setVehicles(data.vehicles)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile()
        fetchVehicles()
      }
    })
  }, [fetchProfile, fetchVehicles])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await clientApiPost("transport/vehicles", {
        type,
        capacity_tons: Number(capacity),
        plate_number: plateNumber,
        price_per_km: Number(pricePerKm),
      })

      setShowAddForm(false)
      fetchVehicles()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create vehicle entry"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            Hello, {profile?.full_name || "Transporter Partner"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your fleet availability, plate registrations, and shipping rates.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{showAddForm ? "Cancel" : "Add Vehicle to Fleet"}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="glass p-8 rounded-xl">
          <div className="flex items-center space-x-2 mb-6">
            <Truck className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold text-white">Add Available Fleet Carrier</h3>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Vehicle Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
                >
                  <option value="pickup">Pickup truck (1.5 tons max)</option>
                  <option value="van">Cargo Van (3 tons max)</option>
                  <option value="truck">Standard Truck (7 tons max)</option>
                  <option value="lorry">Semi-Lorry (15 tons max)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Plate Number</label>
                <input
                  type="text"
                  required
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                  placeholder="KAA 123A"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Load Capacity (Tons)</label>
                <input
                  type="number"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Rate per KM ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={pricePerKm}
                  onChange={(e) => setPricePerKm(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                  placeholder="1.20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow disabled:opacity-50"
            >
              {loading ? "Registering..." : "Add Vehicle"}
            </button>
          </form>
        </div>
      )}

      {/* Fleet carriers list */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">My Registered Fleet</h3>

        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active carriers registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-slate-900/60 p-6 rounded-lg border border-border/40 flex justify-between items-center">
                <div>
                  <h4 className="text-base font-bold text-white capitalize">{v.type} Carrier</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Plate: <span className="text-white font-mono">{v.plate_number}</span> | Capacity: {v.capacity_tons} Tons
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Shipping rate: <span className="text-secondary font-semibold">${v.price_per_km}/KM</span>
                  </p>
                </div>
                <span className="inline-flex items-center space-x-1 text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-full font-bold">
                  <CheckCircle className="h-3 w-3" />
                  <span>Available</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
