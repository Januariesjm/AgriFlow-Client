"use client"

import { useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { clientApiGet, clientApiPatch } from "@/lib/api-client"
import { Profile } from "@/lib/types"

export function useProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Editable fields
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("Kenya")
  const [region, setRegion] = useState("")

  // Password fields
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await clientApiGet<{ profile: Profile }>("profile")
      if (data?.profile) {
        setProfile(data.profile)
        setFullName(data.profile.full_name || "")
        setPhone(data.profile.phone || "")
        setCountry(data.profile.country || "Kenya")
        setRegion(data.profile.region || "")
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load profile"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

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
      setSuccess("Profile updated successfully!")
      setTimeout(() => setSuccess(""), 4000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile"
      setError(message)
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
      const message = err instanceof Error ? err.message : "Password change failed"
      setPasswordError(message)
    } finally {
      setPasswordSaving(false)
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
    loadProfile,
    handleSaveProfile,
    handleChangePassword,
    setError,
    setSuccess,
  }
}
