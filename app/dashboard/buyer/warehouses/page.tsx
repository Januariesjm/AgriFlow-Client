"use client"

import { useState } from "react"
import { useResourceWithFallback } from "@/lib/hooks/useResourceWithFallback"
import { logger } from "@/lib/logger"
import { Warehouse } from "@/lib/types"
import { WarehouseSchema } from "@/lib/schemas"
import { Compass, CheckCircle, Plus, Trash2, Home, BarChart } from "lucide-react"

const DEFAULT_WAREHOUSES: Warehouse[] = [
  {
    id: "wh-1",
    name: "Nairobi Central Depot",
    location: "Nairobi Industrial Area",
    capacity: 500,
    storageType: "Cold Storage",
    gpsLat: -1.3005,
    gpsLng: 36.8822,
    status: "active",
    createdAt: new Date().toISOString(),
  },
]

export default function MyWarehouses() {
  const {
    items: warehouses,
    loading,
    error,
    setError,
    success,
    addResource,
    deleteResource,
  } = useResourceWithFallback<Warehouse>(
    "buyer/warehouses",
    "af_buyer_warehouses",
    DEFAULT_WAREHOUSES,
    (item) => WarehouseSchema.safeParse(item).success
  )

  // Form fields
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [capacity, setCapacity] = useState("")
  const [storageType, setStorageType] = useState("Cold Storage")
  const [gpsLat, setGpsLat] = useState("-1.2921")
  const [gpsLng, setGpsLng] = useState("36.8219")
  const [status, setStatus] = useState<"active" | "inactive">("active")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!name.trim() || !location.trim()) {
        throw new Error("Warehouse name and location are required.")
      }

      const capVal = Number(capacity)
      if (isNaN(capVal) || capVal <= 0) {
        throw new Error("Please enter a valid capacity in tons.")
      }

      const latVal = Number(gpsLat)
      const lngVal = Number(gpsLng)
      if (isNaN(latVal) || isNaN(lngVal)) {
        throw new Error("Please enter valid numeric GPS coordinates.")
      }

      await addResource(
        {
          name,
          location,
          capacity: capVal,
          storageType,
          gpsLat: latVal,
          gpsLng: lngVal,
          status,
          createdAt: new Date().toISOString(),
        },
        "wh"
      )

      setName("")
      setLocation("")
      setCapacity("")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while saving"
      logger.error("BuyerWarehouses", "Form submit failed", err)
      setError(msg)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this warehouse node?")) return
    await deleteResource(id)
  }

  const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0)
  const activeNodes = warehouses.filter((w) => w.status === "active").length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Compass className="h-8 w-8 text-primary" />
          <span>My Warehouse Nodes & Sourcing Profile</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure distribution centers, processing hubs, and delivery coordinates for seamless cross-border supply chain matching.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-xl border border-primary/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-primary font-bold uppercase tracking-wider block">Active Hubs</span>
              <h3 className="text-3xl font-black text-white mt-1">{activeNodes}</h3>
              <p className="text-xs text-muted-foreground mt-1">Receiving inbound dispatches.</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Home className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-secondary/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-secondary font-bold uppercase tracking-wider block">Total Network Capacity</span>
              <h3 className="text-3xl font-black text-white mt-1">{totalCapacity} Tons</h3>
              <p className="text-xs text-muted-foreground mt-1">Storage capability across all depots.</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <BarChart className="h-5 w-5 text-secondary" />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-border/40 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">Default Hub</span>
              <h3 className="text-xl font-bold text-white mt-2 truncate max-w-[200px]">
                {warehouses.length > 0 ? warehouses[0].name : "None configured"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Primary landing depot for orders.</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <Compass className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Register Warehouse Form */}
        <div className="glass p-8 rounded-xl lg:col-span-1">
          <div className="flex items-center space-x-2 mb-6">
            <Plus className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold text-white">Add Logistics Depot</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Warehouse Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="Mombasa Port Transit Terminal"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Location Address</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="Shimanzi Road, Mombasa"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Capacity (Tons)</label>
                <input
                  type="number"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                  placeholder="250"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Storage Mode</label>
                <select
                  value={storageType}
                  onChange={(e) => setStorageType(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
                >
                  <option value="Cold Storage">Cold Storage</option>
                  <option value="Dry Ambient">Dry Ambient</option>
                  <option value="Silo">Silo / Grain Tank</option>
                  <option value="Hazardous">Bulk Liquid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">GPS Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={gpsLat}
                  onChange={(e) => setGpsLat(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">GPS Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={gpsLng}
                  onChange={(e) => setGpsLng(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Operational Status</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus("active")}
                  className={`py-2 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    status === "active"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-slate-900 border-border text-muted-foreground hover:text-white"
                  }`}
                >
                  Active Sourcing
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("inactive")}
                  className={`py-2 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    status === "inactive"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-slate-900 border-border text-muted-foreground hover:text-white"
                  }`}
                >
                  Maintenance
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3 rounded-lg text-sm transition-all cursor-pointer shadow disabled:opacity-50"
            >
              {loading ? "Registering Depot..." : "Add Warehouse Depot"}
            </button>
          </form>
        </div>

        {/* Warehouse Directory */}
        <div className="glass p-8 rounded-xl lg:col-span-2">
          <h3 className="text-xl font-bold text-white mb-6">Registered Warehouse Network</h3>

          {warehouses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No sourcing warehouses registered yet.</p>
          ) : (
            <div className="space-y-4">
              {warehouses.map((w) => (
                <div key={w.id} className="bg-slate-900/60 p-5 rounded-lg border border-border/40 flex justify-between items-start gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{w.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          w.status === "active"
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : "bg-slate-950 border-border text-muted-foreground"
                        }`}>
                          {w.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{w.location}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Storage Type</span>
                        <span className="text-white font-medium">{w.storageType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Capacity</span>
                        <span className="text-white font-medium">{w.capacity} Tons</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Coordinates</span>
                        <span className="text-white font-mono text-[10px]">{w.gpsLat.toFixed(4)}, {w.gpsLng.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(w.id)}
                    className="p-2 rounded-lg bg-slate-800 text-muted-foreground hover:text-destructive hover:bg-slate-700/60 transition-colors"
                    title="Delete Node"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
