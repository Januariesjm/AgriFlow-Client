import { useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { clientApiGet, clientApiPatch } from "@/lib/api-client"
import { Profile } from "@/lib/types"
import { ProfileSchema } from "@/lib/schemas"
import { logger } from "@/lib/logger"

export interface NotificationPrefs {
  emailNotifs: boolean
  bookingNotifs: boolean
  temperatureAlerts: boolean
  inboundTruckAlerts: boolean
}

export function useProfileSettings() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form states
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const [region, setRegion] = useState("")

  // Password states
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    emailNotifs: true,
    bookingNotifs: true,
    temperatureAlerts: true,
    inboundTruckAlerts: true,
  })

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await clientApiGet<{ profile: Profile }>("profile")
      if (data?.profile) {
        const parsed = ProfileSchema.safeParse(data.profile)
        if (parsed.success) {
          const validProfile = parsed.data as Profile
          setProfile(validProfile)
          setFullName(validProfile.full_name || "")
          setPhone(validProfile.phone || "")
          setCountry(validProfile.country || "")
          setRegion(validProfile.region || "")
        } else {
          logger.warn("useProfileSettings", "Invalid profile schema payload from API", parsed.error)
          setError("Profile data payload validation failed.")
        }
      }
    } catch (err) {
      logger.error("useProfileSettings", "Failed to fetch manager profile", err)
      setError("Failed to fetch profile settings.")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadNotifPrefs = useCallback((userId: string) => {
    try {
      const stored = localStorage.getItem(`af_warehouse_notif_prefs_${userId}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        setNotifPrefs({
          emailNotifs: parsed.emailNotifs ?? true,
          bookingNotifs: parsed.bookingNotifs ?? true,
          temperatureAlerts: parsed.temperatureAlerts ?? true,
          inboundTruckAlerts: parsed.inboundTruckAlerts ?? true,
        })
      }
    } catch (err) {
      logger.warn("useProfileSettings", "Failed to load notification preferences from storage", err)
    }
  }, [])

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
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
        const parsed = ProfileSchema.safeParse(data.profile)
        if (parsed.success) {
          setProfile(parsed.data as Profile)
        } else {
          setProfile(data.profile)
        }
      }
      setSuccess("Profile settings saved successfully!")
      setTimeout(() => setSuccess(""), 4000)
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile"
      setError(msg)
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.")
      return false
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      return false
    }

    setPasswordSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw new Error(error.message)

      setPasswordSuccess("Password changed successfully!")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPasswordSuccess(""), 4000)
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password"
      setPasswordError(msg)
      return false
    } finally {
      setPasswordSaving(false)
    }
  }

  const saveNotifPrefs = (userId?: string) => {
    if (!userId && profile?.id) userId = profile.id
    if (userId) {
      localStorage.setItem(`af_warehouse_notif_prefs_${userId}`, JSON.stringify(notifPrefs))
      setSuccess("Notification settings saved!")
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  return {
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
  }
}
