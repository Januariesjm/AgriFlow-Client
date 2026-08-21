"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Compass, CheckCircle2, Save, ShoppingBag, Globe, Phone, MapPin } from "lucide-react"
import PlaceAutocomplete from "@/components/maps/PlaceAutocomplete"
import GoogleMap from "@/components/maps/GoogleMap"

import { useSession } from "@/lib/hooks/useSession"

export default function VendorStorefront() {
  const { session } = useSession()

  // Storefront fields
  const [storeName, setStoreName] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [gpsLat, setGpsLat] = useState("-1.2921")
  const [gpsLng, setGpsLng] = useState("36.8219")
  const [storeStatus, setStoreStatus] = useState("open") // open or closed
  const [deliveryRate, setDeliveryRate] = useState("1.5") // $/km

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (session?.user) {
      // Load stored storefront
      const stored = localStorage.getItem(`af_vendor_store_${session.user.id}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        setStoreName(parsed.name || "")
        setDescription(parsed.description || "")
        setAddress(parsed.address || "")
        setPhone(parsed.phone || "")
        setGpsLat(parsed.gpsLat || "-1.2921")
        setGpsLng(parsed.gpsLng || "36.8219")
        setStoreStatus(parsed.status || "open")
        setDeliveryRate(parsed.deliveryRate || "1.5")
      } else {
        // Defaults
        setStoreName("East Africa Agri-Inputs Ltd")
        setDescription("Your premium destination for hybrid seeds, fertilizers, and modern tractor tools.")
        setAddress("Industrial Area Road, Block G, Nairobi")
        setPhone("+254 722 000111")
      }
    }
  }, [session])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!storeName.trim() || !address.trim()) {
        throw new Error("Store name and business address are required.")
      }

      const latVal = Number(gpsLat)
      const lngVal = Number(gpsLng)
      if (isNaN(latVal) || isNaN(lngVal)) {
        throw new Error("Please provide valid numeric GPS coordinates.")
      }

      const rateVal = Number(deliveryRate)
      if (isNaN(rateVal) || rateVal < 0) {
        throw new Error("Please enter a valid delivery mileage rate.")
      }

      const storeData = {
        name: storeName,
        description,
        address,
        phone,
        gpsLat,
        gpsLng,
        status: storeStatus,
        deliveryRate
      }

      if (session?.user) {
        localStorage.setItem(`af_vendor_store_${session.user.id}`, JSON.stringify(storeData))
      }

      setSuccess("Storefront profile saved successfully!")
      setTimeout(() => setSuccess(""), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Compass className="h-8 w-8 text-primary" />
          <span>Storefront Profile Configurator</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Customize your agro-inputs business name, set shop locations, define coordinates, and set self-delivery rates for farmers.
        </p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Main card */}
      <div className="glass p-8 rounded-xl">
        <div className="flex items-center space-x-2.5 mb-6 border-b border-border/20 pb-4">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-white">Agro-Storefront Settings</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Agro-Store Business Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Kenya Farmers Input Depot"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Business Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +254 722 000111"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Store Tagline / Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your specialize inputs (e.g. certified maize seeds, pesticide sprayers, animal feeds)..."
              className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Physical Shop Address</label>
            <PlaceAutocomplete
              value={address}
              onChange={setAddress}
              onPlaceSelect={(addr, lat, lng) => {
                setAddress(addr)
                setGpsLat(lat.toString())
                setGpsLng(lng.toString())
              }}
              placeholder="Search storefront address..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">GPS Latitude</label>
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
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">GPS Longitude</label>
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
            <label className="block text-sm font-semibold text-muted-foreground">Storefront Map Location</label>
            <GoogleMap
              lat={Number(gpsLat) || -1.2921}
              lng={Number(gpsLng) || 36.8219}
              label={storeName || "My Storefront"}
              height="240px"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-border/20 pt-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Self-Delivery Freight Rate ($ per km)</label>
              <input
                type="number"
                step="0.1"
                required
                value={deliveryRate}
                onChange={(e) => setDeliveryRate(e.target.value)}
                placeholder="1.5"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Storefront Operational Status</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStoreStatus("open")}
                  className={`py-2.5 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    storeStatus === "open"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-slate-900 border-border text-muted-foreground hover:text-white"
                  }`}
                >
                  Open for Orders
                </button>
                <button
                  type="button"
                  onClick={() => setStoreStatus("closed")}
                  className={`py-2.5 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    storeStatus === "closed"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-slate-900 border-border text-muted-foreground hover:text-white"
                  }`}
                >
                  Closed / Vacation
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3 rounded-lg text-sm transition-all cursor-pointer shadow disabled:opacity-50"
          >
            <Save className="h-4.5 w-4.5" />
            <span>{loading ? "Saving Profile..." : "Save Storefront Profile"}</span>
          </button>
        </form>
      </div>

      {/* Profile showcase card */}
      <div className="glass p-6 rounded-xl space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Storefront Visual Cards Preview</h4>
        <div className="bg-slate-900/60 rounded-lg p-5 border border-border/30 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-1">
            <span className="text-base font-bold text-white">{storeName || "My Agro Store"}</span>
            <p className="text-xs text-muted-foreground">{description || "No description set yet."}</p>
            <div className="flex gap-4 text-[10px] text-muted-foreground pt-1.5">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {address}</span>
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {phone}</span>
            </div>
          </div>

          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border shrink-0 ${
            storeStatus === "open"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-slate-950 border-border text-muted-foreground"
          }`}>
            {storeStatus}
          </span>
        </div>
      </div>
    </div>
  )
}
