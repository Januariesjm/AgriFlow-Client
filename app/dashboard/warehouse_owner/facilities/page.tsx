"use client"

import { useState } from "react"
import { useResourceWithFallback } from "@/lib/hooks/useResourceWithFallback"
import { logger } from "@/lib/logger"
import { FacilityFormSchema, formatZodIssues } from "@/lib/schemas"
import { Facility } from "@/lib/types"
import { Compass, Plus, Trash2, Globe, MapPin, Shield } from "lucide-react"
import PlaceAutocomplete from "@/components/maps/PlaceAutocomplete"
import GoogleMap from "@/components/maps/GoogleMap"

const DEFAULT_FACILITIES: Facility[] = [
  { id: "f1", name: "Rift Valley Cold Hub", type: "Cold Storage", capacity: 500, occupied: 320, dailyRate: 0.8, address: "Nakuru Industrial Block 4", gpsLat: "-0.3031", gpsLng: "36.0613", status: "active" },
  { id: "f2", name: "Nakuru Dry Silos", type: "Grain Silo", capacity: 1500, occupied: 950, dailyRate: 0.4, address: "Silo Road, Section 5, Nakuru", gpsLat: "-0.2831", gpsLng: "36.0713", status: "active" },
  { id: "f3", name: "Molo Ambient Store", type: "Ambient Dry", capacity: 800, occupied: 120, dailyRate: 0.3, address: "Molo Town Depot B", gpsLat: "-0.2483", gpsLng: "35.7314", status: "active" },
]

export default function WarehouseFacilities() {
  const {
    items: facilities,
    setItems,
    loading,
    error,
    setError,
    success,
    setSuccess,
    addResource,
    deleteResource,
  } = useResourceWithFallback<Facility>("warehouse-owner/facilities", "af_warehouse_facilities", DEFAULT_FACILITIES)

  // Form states
  const [name, setName] = useState("")
  const [type, setType] = useState("Cold Storage")
  const [capacity, setCapacity] = useState("")
  const [dailyRate, setDailyRate] = useState("")
  const [address, setAddress] = useState("")
  const [gpsLat, setGpsLat] = useState("-1.2921")
  const [gpsLng, setGpsLng] = useState("36.8219")
  const [status, setStatus] = useState<Facility["status"]>("active")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const parsed = FacilityFormSchema.safeParse({
        name,
        type,
        capacity,
        dailyRate,
        address,
        gpsLat,
        gpsLng,
        status,
      })
      if (!parsed.success) {
        setError(formatZodIssues(parsed.error))
        return
      }

      await addResource(
        {
          name: parsed.data.name,
          type: parsed.data.type,
          capacity: parsed.data.capacity,
          occupied: 0,
          dailyRate: parsed.data.dailyRate,
          address: parsed.data.address,
          gpsLat: String(parsed.data.gpsLat),
          gpsLng: String(parsed.data.gpsLng),
          status: parsed.data.status,
        },
        "fac"
      )

      setName("")
      setCapacity("")
      setDailyRate("")
      setAddress("")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while registering facility"
      logger.error("WarehouseFacilities", "Form submit failed", err)
      setError(msg)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this storage depot?")) return
    await deleteResource(id)
  }

  const toggleStatus = (id: string, current: Facility["status"]) => {
    const nextStatus: Facility["status"] = current === "active" ? "full" : current === "full" ? "maintenance" : "active"
    const updated = facilities.map((f) => (f.id === id ? { ...f, status: nextStatus } : f))
    setItems(updated)
    setSuccess(`Facility status updated to ${nextStatus}!`)
    setTimeout(() => setSuccess(""), 4000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Compass className="h-8 w-8 text-primary" />
          <span>Warehouse Facilities Directory</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Add and manage storage silos, cold houses, and ambient dry depots under your network.
        </p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Register Facility Form */}
        <div className="glass p-8 rounded-xl lg:col-span-1 h-fit">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Register Storage Depot
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Facility Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eldoret Grain Terminal"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Storage Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none"
                >
                  <option value="Cold Storage">Cold Storage</option>
                  <option value="Grain Silo">Grain Silo</option>
                  <option value="Ambient Dry">Ambient Dry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Facility["status"])}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="full">Full</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Capacity (tons)</label>
                <input
                  type="number"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="500"
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Daily Rate ($ / ton)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  placeholder="0.50"
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Physical Location Address</label>
              <PlaceAutocomplete
                value={address}
                onChange={setAddress}
                onPlaceSelect={(addr, lat, lng) => {
                  setAddress(addr)
                  setGpsLat(lat.toString())
                  setGpsLng(lng.toString())
                }}
                placeholder="Search facility address..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">GPS Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={gpsLat}
                  onChange={(e) => setGpsLat(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">GPS Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={gpsLng}
                  onChange={(e) => setGpsLng(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted-foreground uppercase">Depot Location Map Pin</label>
              <GoogleMap
                lat={Number(gpsLat) || -1.2921}
                lng={Number(gpsLng) || 36.8219}
                label={name || "Depot Location"}
                height="220px"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-6 py-3 rounded-lg text-sm transition-all cursor-pointer shadow"
            >
              Add Depot to Directory
            </button>
          </form>
        </div>

        {/* Facilities Directory List */}
        <div className="glass p-8 rounded-xl lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Active Facilities Network
          </h3>

          {facilities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No storage facilities registered yet.</p>
          ) : (
            <div className="space-y-4">
              {facilities.map((f) => (
                <div key={f.id} className="bg-slate-900/60 p-5 rounded-lg border border-border/40 flex justify-between items-start gap-4">
                  <div className="space-y-3 flex-1">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-bold text-white">{f.name}</span>
                        <span className="bg-slate-950 border border-border text-[9px] text-muted-foreground font-semibold px-2 py-0.5 rounded-full uppercase">
                          {f.type}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          f.status === "active"
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : f.status === "full"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            : "bg-red-500/10 border-red-500/20 text-red-500"
                        }`}>
                          {f.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{f.address}</span>
                        <span className="flex items-center gap-0.5 ml-2"><Globe className="h-3 w-3" /> Lat: {f.gpsLat}, Lng: {f.gpsLng}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Total Capacity</span>
                        <span className="text-white font-bold">{f.capacity} Tons</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Occupied space</span>
                        <span className="text-white font-bold">{f.occupied} Tons ({((f.occupied / f.capacity) * 100).toFixed(0)}%)</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Available space</span>
                        <span className="text-primary font-bold">{f.capacity - f.occupied} Tons</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Daily Rent Rate</span>
                        <span className="text-secondary font-bold">${f.dailyRate.toFixed(2)}/ton</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleStatus(f.id, f.status)}
                      className="text-xs bg-slate-800 text-muted-foreground hover:text-white px-3 py-1.5 rounded-lg border border-border/30 hover:border-border transition-colors font-semibold cursor-pointer"
                    >
                      Cycle Status
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-muted-foreground hover:text-destructive hover:bg-slate-700/60 transition-colors flex items-center justify-center cursor-pointer"
                      title="Delete Facility"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
