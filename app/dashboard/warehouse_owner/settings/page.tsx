"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useProfileSettings } from "@/lib/hooks/useProfileSettings"
import { Settings, User, Phone, Mail, Shield, CheckCircle2, AlertCircle, Key, Globe } from "lucide-react"

export default function WarehouseSettings() {
  const {
    profile,
    loading,
    saving,
    error,
    success,
    fullName,
    setFullName,
    phone,
    setPhone,
    country,
    setCountry,
    region,
    setRegion,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordSaving,
    passwordSuccess,
    passwordError,
    notifPrefs,
    setNotifPrefs,
    fetchProfile,
    loadNotifPrefs,
    handleSaveProfile,
    handleChangePassword,
    saveNotifPrefs,
  } = useProfileSettings()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile()
        loadNotifPrefs(session.user.id)
      }
    })
  }, [fetchProfile, loadNotifPrefs])

  const handleNotifSubmit = () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      saveNotifPrefs(session?.user.id)
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
          <span>Warehouse settings & Security</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Adjust manager profile credentials, update email alert rules, and manage passwords.
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
          {profile?.full_name?.charAt(0).toUpperCase() || "W"}
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
          <span className="text-[10px] font-bold px-3 py-1 rounded-full border uppercase bg-primary/10 border-primary/20 text-primary">
            Warehouse owner
          </span>
        </div>
      </div>

      {/* Personal Info Edit */}
      <div className="glass p-8 rounded-xl">
        <div className="flex items-center space-x-2.5 mb-6">
          <User className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-white">Representative Details</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 700 000000"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none"
              >
                <option value="Kenya">Kenya</option>
                <option value="Uganda">Uganda</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Rwanda">Rwanda</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Region</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Eldoret, Nakuru, etc."
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow disabled:opacity-50"
          >
            {saving ? "Saving changes..." : "Save Settings"}
          </button>
        </form>
      </div>

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
            { key: "emailNotifs" as const, label: "General Email Reports", desc: "Receive weekly facility statistics summaries" },
            { key: "bookingNotifs" as const, label: "New Booking Notifications", desc: "Receive instant notifications when tenants request storage space" },
            { key: "temperatureAlerts" as const, label: "Silo/Cold Room Temp alerts", desc: "Get critical alerts when silo moisture or cold room temperatures drift" },
            { key: "inboundTruckAlerts" as const, label: "Inbound Truck Manifest Alerts", desc: "Get notifications when cargo trucks enter dispatch zones" },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between bg-slate-900/60 rounded-lg p-4 border border-border/30">
              <div>
                <span className="text-sm font-semibold text-white block">{pref.label}</span>
                <span className="text-[10px] text-muted-foreground">{pref.desc}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotifPrefs({ ...notifPrefs, [pref.key]: !notifPrefs[pref.key] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  notifPrefs[pref.key] ? "bg-primary" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifPrefs[pref.key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleNotifSubmit}
          className="mt-5 bg-slate-800 hover:bg-slate-700/80 border border-border text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
        >
          Save Notification Preferences
        </button>
      </div>
    </div>
  )
}
