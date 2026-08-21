"use client"
import { logger } from "@/lib/logger"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { clientApiGet, clientApiPost, clientApiPut } from "@/lib/api-client"
import { Farm } from "@/lib/types"
import { Compass, CheckCircle } from "lucide-react"
import PlaceAutocomplete from "@/components/maps/PlaceAutocomplete"
import GoogleMap from "@/components/maps/GoogleMap"

export default function MyFarm() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [farmSize, setFarmSize] = useState("")
  const [soilType, setSoilType] = useState("Loam")
  const [waterSource, setWaterSource] = useState("Rainfed")
  const [gpsLat, setGpsLat] = useState("-1.2921")
  const [gpsLng, setGpsLng] = useState("36.8219")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const fetchFarms = useCallback(async () => {
    try {
      const data = await clientApiGet<{ farms: Farm[] }>("farms")
      if (data?.farms) {
        setFarms(data.farms)
        if (data.farms.length > 0) {
          const farm = data.farms[0]
          setName(farm.name)
          setLocation(farm.location)
          setFarmSize(farm.farm_size?.toString() || "")
          setSoilType(farm.soil_type || "Loam")
          setWaterSource(farm.water_source || "Rainfed")
          setGpsLat(farm.gps_lat?.toString() || "-1.2921")
          setGpsLng(farm.gps_lng?.toString() || "36.8219")
        }
      }
    } catch (err) {
      logger.error("DashboardFarmerFarm", "Operation failed", err)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchFarms()
      }
    })
  }, [fetchFarms])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const isEditing = farms.length > 0
      const payload = {
        name,
        location,
        country: "Kenya",
        region: location,
        farm_size: Number(farmSize),
        soil_type: soilType,
        water_source: waterSource,
        gps_lat: Number(gpsLat),
        gps_lng: Number(gpsLng),
      }

      if (isEditing) {
        await clientApiPut(`farms/${farms[0].id}`, payload)
      } else {
        await clientApiPost("farms", payload)
      }

      setSuccess(true)
      fetchFarms()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save farm profile"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white">My Farm Profile</h1>
        <p className="text-muted-foreground mt-1">
          Define soil structures, crop sizes, and location configurations for intelligent crop matchmaking.
        </p>
      </div>

      <div className="glass p-8 rounded-xl">
        <div className="flex items-center space-x-2 mb-6">
          <Compass className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-white">Geographic & Soil Configuration</h3>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span>Farm profile configured and updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Farm Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                placeholder="Elgon Valley Farm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Region Location</label>
              <PlaceAutocomplete
                value={location}
                onChange={setLocation}
                onPlaceSelect={(address, lat, lng) => {
                  setLocation(address)
                  setGpsLat(lat.toString())
                  setGpsLng(lng.toString())
                }}
                placeholder="Search farm location..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Size (Acres)</label>
              <input
                type="number"
                required
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                placeholder="5"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Soil Classification</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
              >
                <option value="Loam">Loam / Rich</option>
                <option value="Clay">Clay / Dense</option>
                <option value="Sandy">Sandy / Quick dry</option>
                <option value="Silt">Silt / Silt loam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Water Source</label>
              <select
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
              >
                <option value="Rainfed">Rainfed / Season dependent</option>
                <option value="Irrigated">Irrigated / Continuous</option>
                <option value="Borehole">Borehole / Groundwater</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-muted-foreground">Farm Map Pin</label>
            <GoogleMap
              lat={Number(gpsLat) || -1.2921}
              lng={Number(gpsLng) || 36.8219}
              label={name || "My Farm"}
              height="250px"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow disabled:opacity-50"
          >
            {loading ? "Saving Farm profile..." : farms.length > 0 ? "Update Farm Profile" : "Register Farm Profile"}
          </button>
        </form>
      </div>
    </div>
  )
}
