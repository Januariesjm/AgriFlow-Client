"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Settings, User, MapPin, Phone, Mail, Shield, CheckCircle2, AlertCircle, Key, Globe, Compass } from "lucide-react"

export default function BuyerSettings() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Editable fields
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const [region, setRegion] = useState("")

  // Password change
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Notification & Sourcing preferences (client-side)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [orderNotifs, setOrderNotifs] = useState(true)
  const [priceAlerts, setPriceAlerts] = useState(true)
  const [maxSourcingRange, setMaxSourcingRange] = useState("250") // km

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.access_token)
        // Load notification prefs
        const stored = localStorage.getItem(`af_buyer_notif_prefs_${session.user.id}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          setEmailNotifs(parsed.emailNotifs ?? true)
          setOrderNotifs(parsed.orderNotifs ?? true)
          setPriceAlerts(parsed.priceAlerts ?? true)
          setMaxSourcingRange(parsed.maxSourcingRange ?? "250")
        }
      }
    })
  }, [])

  const fetchProfile = async (token: string) => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:4000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
        setFullName(data.profile.full_name || "")
        setPhone(data.profile.phone || "")
        setCountry(data.profile.country || "")
        setRegion(data.profile.region || "")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      const res = await fetch("http://localhost:4000/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          country,
          region,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to update profile")
      }

      const data = await res.json()
      setProfile(data.profile)
      setSuccess("Profile updated successfully!")
      setTimeout(() => setSuccess(""), 4000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      return
    }

    setPasswordSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw new Error(error.message)

      setPasswordSuccess("Password changed successfully!")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPasswordSuccess(""), 4000)
    } catch (err: any) {
      setPasswordError(err.message)
    } finally {
      setPasswordSaving(false)
    }
  }

  const saveSourcingPrefs = () => {
    if (session?.user) {
      const prefs = { emailNotifs, orderNotifs, priceAlerts, maxSourcingRange }
      localStorage.setItem(`af_buyer_notif_prefs_${session.user.id}`, JSON.stringify(prefs))
      setSuccess("Sourcing settings saved successfully!")
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Buyer Sourcing & Profile Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage corporate credentials, adjust sourcing boundaries, modify notification levels, and change system passwords.
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

      {/* Corporate Profile Summary Card */}
      <div className="glass p-6 rounded-xl flex items-center gap-6">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-2xl shrink-0">
          {profile?.full_name?.charAt(0).toUpperCase() || "B"}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{profile?.full_name}</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {profile?.email}</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {profile?.phone || "No phone added"}</span>
            <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {profile?.country}, {profile?.region || "No region added"}</span>
          </div>
        </div>
        <div className="shrink-0">
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase ${
            profile?.is_verified
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-amber-500/10 border-amber-500/20 text-amber-500"
          }`}>
            {profile?.is_verified ? "Verified Buyer" : "Standard Buyer"}
          </span>
        </div>
      </div>

      {/* Sourcing Profile */}
      <div className="glass p-8 rounded-xl">
        <div className="flex items-center space-x-2.5 mb-6">
          <User className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-white">Sourcing Profile details</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Company Representative / Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Business Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 700 000000"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Sourcing Country HQ</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="Kenya">Kenya</option>
                <option value="Uganda">Uganda</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Rwanda">Rwanda</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Operating Region</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. Nairobi, Kampala"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Profile Details"}
          </button>
        </form>
      </div>

      {/* Sourcing preferences */}
      <div className="glass p-8 rounded-xl">
        <div className="flex items-center space-x-2.5 mb-6">
          <Compass className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-white">Sourcing & Notification Limits</h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Maximum Sourcing Distance Range ({maxSourcingRange} km)</label>
            <input
              type="range"
              min="50"
              max="1500"
              step="50"
              value={maxSourcingRange}
              onChange={(e) => setMaxSourcingRange(e.target.value)}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Local (50 km)</span>
              <span>Regional Corridor (1,500 km)</span>
            </div>
          </div>

          {[
            { label: "Contract Updates", desc: "Send notifications when orders are verified, dispatched, or completed", state: orderNotifs, setter: setOrderNotifs },
            { label: "Price Arbitration Alerts", desc: "Notify when regional agricultural crop prices drop below threshold", state: priceAlerts, setter: setPriceAlerts },
            { label: "General Email Reports", desc: "Receive monthly spend analytics summaries", state: emailNotifs, setter: setEmailNotifs },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between bg-slate-900/60 rounded-lg p-4 border border-border/30">
              <div>
                <span className="text-sm font-semibold text-white block">{pref.label}</span>
                <span className="text-[10px] text-muted-foreground">{pref.desc}</span>
              </div>
              <button
                onClick={() => pref.setter(!pref.state)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  pref.state ? "bg-primary" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pref.state ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}

          <button
            onClick={saveSourcingPrefs}
            className="bg-slate-800 hover:bg-slate-700/80 border border-border text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
          >
            Save Sourcing Settings
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="glass p-8 rounded-xl">
        <div className="flex items-center space-x-2.5 mb-6">
          <Key className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-white">Security & Password Reset</h3>
        </div>

        {passwordSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg mb-5 flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg mb-5 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">New password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Repeat password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordSaving}
            className="bg-slate-800 hover:bg-slate-700/80 border border-border text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
          >
            {passwordSaving ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  )
}
