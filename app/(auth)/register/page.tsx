"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sprout, Lock, Mail, User, Phone, ArrowRight, Shield } from "lucide-react"
import { supabase } from "@/lib/supabase"
import PlaceAutocomplete from "@/components/maps/PlaceAutocomplete"
import GoogleMap from "@/components/maps/GoogleMap"

export default function Register() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("farmer")
  const [country, setCountry] = useState("Kenya")
  const [region, setRegion] = useState("")
  const [addressSearch, setAddressSearch] = useState("")
  const [gpsLat, setGpsLat] = useState("")
  const [gpsLng, setGpsLng] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handlePlaceSelect = (address: string, lat: number, lng: number, place: any) => {
    setAddressSearch(address)
    setGpsLat(lat.toString())
    setGpsLng(lng.toString())

    let foundCountry = ""
    let foundRegion = ""

    if (place?.address_components) {
      for (const component of place.address_components) {
        const types = component.types || []
        if (types.includes("country")) {
          foundCountry = component.long_name
        }
        if (
          types.includes("administrative_area_level_1") ||
          types.includes("administrative_area_level_2") ||
          types.includes("locality")
        ) {
          foundRegion = component.long_name
        }
      }
    }

    if (foundCountry) {
      const lower = foundCountry.toLowerCase()
      if (lower.includes("kenya")) setCountry("Kenya")
      else if (lower.includes("uganda")) setCountry("Uganda")
      else if (lower.includes("tanzania")) setCountry("Tanzania")
      else if (lower.includes("rwanda")) setCountry("Rwanda")
    }

    if (foundRegion) {
      setRegion(foundRegion)
    } else {
      setRegion(address.split(",")[0])
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Create user directly via the Express API Backend
      // This synchronizes Supabase Admin Auth & creates the Profiles record in a single transacted endpoint
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          phone,
          role,
          country,
          region,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        setError(errData.error || "Registration failed")
        setLoading(false)
        return
      }

      // Automatically sign in locally using Supabase auth to set local token
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError || !authData.session) {
        router.push("/login")
        return
      }

      router.push(`/dashboard/${role}`)
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-animate flex items-center justify-center px-4 py-12">
      <div className="glass w-full max-w-xl p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Agri<span className="text-primary">Flow</span>
            </span>
          </Link>
          <h2 className="text-xl font-semibold text-foreground">Create Your Account</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Join thousands of growers, traders, and logistics agents in East Africa
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="+254 700 000000"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
              Search Business / Farm Address (GPS Autocomplete)
            </label>
            <PlaceAutocomplete
              value={addressSearch}
              onChange={setAddressSearch}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Search address (e.g. Nakuru, Eldoret, Kampala)..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                Account Type
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="farmer">Farmer / Grower</option>
                <option value="buyer">Trader / Buyer</option>
                <option value="transporter">Transporter</option>
                <option value="vendor">Input Vendor</option>
                <option value="warehouse_owner">Warehouse Owner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="Kenya">Kenya</option>
                <option value="Uganda">Uganda</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Rwanda">Rwanda</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
                Region / County
              </label>
              <input
                type="text"
                required
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                placeholder="e.g. Nakuru"
              />
            </div>
          </div>

          {gpsLat && gpsLng && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-muted-foreground">Location Pin Preview</label>
              <GoogleMap
                lat={Number(gpsLat)}
                lng={Number(gpsLng)}
                label={fullName || "Your Location"}
                height="200px"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg shadow transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
