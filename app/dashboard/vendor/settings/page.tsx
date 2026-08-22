"use client"
import { logger } from "@/lib/logger"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { clientApiGet, clientApiPatch } from "@/lib/api-client"
import { Profile } from "@/lib/types"
import VendorSettingsForm from "@/components/vendor/VendorSettingsForm"
import { Settings, Phone, Mail, Shield, CheckCircle2, AlertCircle, Key, Globe } from "lucide-react"

export default function VendorSettings() {
  const [profile, setProfile] = useState<Profile | null>(null)
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

  // Notification preferences (client-side)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [orderNotifs, setOrderNotifs] = useState(true)
  const [stockAlerts, setStockAlerts] = useState(true)
  const [advisoryNotifs, setAdvisoryNotifs] = useState(true)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const data = await clientApiGet<{ profile: Profile }>("profile")
      if (data?.profile) {
        setProfile(data.profile)
        setFullName(data.profile.full_name || "")
        setPhone(data.profile.phone || "")
        setCountry(data.profile.country || "")
        setRegion(data.profile.region || "")
      }
    } catch (err) {
      logger.error("DashboardVendorSettings", "Operation failed", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile()
        const stored = localStorage.getItem(`af_vendor_notif_prefs_${session.user.id}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          setEmailNotifs(parsed.emailNotifs ?? true)
          setOrderNotifs(parsed.orderNotifs ?? true)
          setStockAlerts(parsed.stockAlerts ?? true)
          setAdvisoryNotifs(parsed.advisoryNotifs ?? true)
        }
      }
    })
  }, [fetchProfile])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      const data = await clientApiPatch<{ profile: Profile }>("profile", {
        full_name: fullName,
        phone,
        country,
        region,
      })

      if (data?.profile) {
        setProfile(data.profile)
      }
      setSuccess("Profile settings saved successfully!")
      setTimeout(() => setSuccess(""), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile"
      setError(msg)
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password"
      setPasswordError(msg)
    } finally {
      setPasswordSaving(false)
    }
  }

  const saveNotifPrefs = () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const prefs = { emailNotifs, orderNotifs, stockAlerts, advisoryNotifs }
        localStorage.setItem(`af_vendor_notif_prefs_${session.user.id}`, JSON.stringify(prefs))
        setSuccess("Notification settings saved!")
        setTimeout(() => setSuccess(""), 3000)
      }
    })
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
          <span>Vendor Settings & Security</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Adjust store managers, configure notification filters, reset passwords, and manage personal data.
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

      {/* Account Info card */}
      <div className="glass p-6 rounded-xl flex items-center gap-6">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-2xl shrink-0">
          {profile?.full_name?.charAt(0).toUpperCase() || "V"}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{profile?.full_name}</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {profile?.email}</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {profile?.phone || "No phone"}</span>
            <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {profile?.country}, {profile?.region || "No region"}</span>
          </div>
        </div>
        <div className="shrink-0">
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase ${
            profile?.is_verified
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-amber-500/10 border-amber-500/20 text-amber-500"
          }`}>
            {profile?.is_verified ? "Verified Vendor" : "Standard Vendor"}
          </span>
        </div>
      </div>

      {/* Personal Info Edit */}
      <VendorSettingsForm
        fullName={fullName}
        onFullNameChange={setFullName}
        phone={phone}
        onPhoneChange={setPhone}
        country={country}
        onCountryChange={setCountry}
        region={region}
        onRegionChange={setRegion}
        saving={saving}
        onSave={handleSaveProfile}
      />

      {/* Security */}
      <div className="glass p-8 rounded-xl">
        <div className="flex items-center space-x-2.5 mb-6">
          <Key className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-white">Reset Account Password</h3>
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

      {/* Notification Preferences */}
      <div className="glass p-8 rounded-xl">
        <div className="flex items-center space-x-2.5 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-white">Notification Alert Levels</h3>
        </div>

        <div className="space-y-4">
          {[
            { label: "General Email Reports", desc: "Receive weekly store orders and wallet withdrawal summaries", state: emailNotifs, setter: setEmailNotifs },
            { label: "Farmer Order Notifications", desc: "Receive instant notifications when farmers place new input orders", state: orderNotifs, setter: setOrderNotifs },
            { label: "Inventory Threshold Warnings", desc: "Get notified when listed input items fall below 10 units in stock", state: stockAlerts, setter: setStockAlerts },
            { label: " Farmer Advisory Alerts", desc: "Receive notifications when farmers submit crop advisory inquiries", state: advisoryNotifs, setter: setAdvisoryNotifs },
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
        </div>

        <button
          onClick={saveNotifPrefs}
          className="mt-5 bg-slate-800 hover:bg-slate-700/80 border border-border text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
        >
          Save Notification Preferences
        </button>
      </div>
    </div>
  )
}
