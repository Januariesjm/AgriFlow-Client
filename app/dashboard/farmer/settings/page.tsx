"use client"
import { logger } from "@/lib/logger"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/hooks/useSession"
import { useProfileForm } from "@/lib/hooks/useProfileForm"
import { Settings, User, Phone, Mail, Shield, CheckCircle2, AlertCircle, Key, Globe } from "lucide-react"

export default function FarmerSettings() {
  const { session } = useSession()
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
    loadProfile,
    handleSaveProfile,
    handleChangePassword,
    setSuccess,
  } = useProfileForm()

  // Notification preferences (client-side)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [orderNotifs, setOrderNotifs] = useState(true)
  const [priceAlerts, setPriceAlerts] = useState(true)
  const [weatherAlerts, setWeatherAlerts] = useState(true)

  useEffect(() => {
    if (session) {
      loadProfile()
      const stored = localStorage.getItem(`af_notif_prefs_${session.user.id}`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setEmailNotifs(parsed.emailNotifs ?? true)
          setOrderNotifs(parsed.orderNotifs ?? true)
          setPriceAlerts(parsed.priceAlerts ?? true)
          setWeatherAlerts(parsed.weatherAlerts ?? true)
        } catch (e) {
          logger.error("DashboardFarmerSettings", "Operation failed", e)
        }
      }
    }
  }, [session, loadProfile])

  const saveNotifPrefs = () => {
    if (session?.user) {
      const prefs = { emailNotifs, orderNotifs, priceAlerts, weatherAlerts }
      localStorage.setItem(`af_notif_prefs_${session.user.id}`, JSON.stringify(prefs))
      setSuccess("Notification preferences saved!")
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
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information, security, and notification preferences.
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

      {/* Account Info Card */}
      <div className="glass p-6 rounded-xl flex items-center gap-6">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-2xl shrink-0">
          {profile?.full_name?.charAt(0).toUpperCase() || "?"}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{profile?.full_name}</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {profile?.email}</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {profile?.phone || "Not set"}</span>
            <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {profile?.country}, {profile?.region || "N/A"}</span>
          </div>
        </div>
        <div className="shrink-0">
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase ${
            profile?.is_verified
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-amber-500/10 border-amber-500/20 text-amber-500"
          }`}>
            {profile?.is_verified ? "Verified" : "Unverified"}
          </span>
        </div>
      </div>

      {/* Profile Edit */}
      <div className="glass p-8 rounded-xl">
        <div className="flex items-center space-x-2.5 mb-6">
          <User className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-white">Personal Information</h3>
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
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Phone Number</label>
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
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Country</label>
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
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Region</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Nakuru, Kiambu, etc."
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <span>Email: <strong className="text-white">{profile?.email}</strong> — managed through authentication provider</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </form>
      </div>

      {/* Security */}
      <div className="glass p-8 rounded-xl">
        <div className="flex items-center space-x-2.5 mb-6">
          <Key className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-white">Security & Password</h3>
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
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordSaving}
            className="bg-slate-800 hover:bg-slate-700/80 border border-border text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {passwordSaving ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="glass p-8 rounded-xl">
        <div className="flex items-center space-x-2.5 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-white">Notification Preferences</h3>
        </div>

        <div className="space-y-4">
          {[
            { label: "Email Notifications", desc: "Receive order updates and system alerts via email", state: emailNotifs, setter: setEmailNotifs },
            { label: "Order Notifications", desc: "Get notified when new orders are placed or statuses change", state: orderNotifs, setter: setOrderNotifs },
            { label: "Price Alerts", desc: "Receive alerts when market prices change significantly for your crops", state: priceAlerts, setter: setPriceAlerts },
            { label: "Weather Advisories", desc: "Get weather and pest warnings for your farming region", state: weatherAlerts, setter: setWeatherAlerts },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between bg-slate-900/60 rounded-lg p-4 border border-border/30">
              <div>
                <span className="text-sm font-semibold text-white block">{pref.label}</span>
                <span className="text-[10px] text-muted-foreground">{pref.desc}</span>
              </div>
              <button
                type="button"
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
          type="button"
          onClick={saveNotifPrefs}
          className="mt-5 bg-slate-800 hover:bg-slate-700/80 border border-border text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
        >
          Save Notification Preferences
        </button>
      </div>

      {/* Account metadata */}
      {profile && (
        <div className="glass p-6 rounded-xl text-xs text-muted-foreground space-y-2">
          <h4 className="text-sm font-bold text-white mb-3">Account Information</h4>
          <p>Account ID: <span className="font-mono text-white">{profile.id}</span></p>
          <p>Role: <span className="text-primary font-bold uppercase">{profile.role}</span></p>
          {profile.created_at && <p>Joined: <span className="text-white">{new Date(profile.created_at).toLocaleDateString()}</span></p>}
          {profile.updated_at && <p>Last Updated: <span className="text-white">{new Date(profile.updated_at).toLocaleDateString()}</span></p>}
        </div>
      )}
    </div>
  )
}
