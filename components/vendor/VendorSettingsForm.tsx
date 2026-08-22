"use client"

import { User } from "lucide-react"

export interface VendorSettingsFormProps {
  fullName: string
  onFullNameChange: (val: string) => void
  phone: string
  onPhoneChange: (val: string) => void
  country: string
  onCountryChange: (val: string) => void
  region: string
  onRegionChange: (val: string) => void
  saving: boolean
  onSave: (e: React.FormEvent) => void
}

export default function VendorSettingsForm({
  fullName,
  onFullNameChange,
  phone,
  onPhoneChange,
  country,
  onCountryChange,
  region,
  onRegionChange,
  saving,
  onSave,
}: VendorSettingsFormProps) {
  return (
    <div className="glass p-8 rounded-xl">
      <div className="flex items-center space-x-2.5 mb-6">
        <User className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-bold text-white">Representative Details</h3>
      </div>

      <form onSubmit={onSave} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Full Name</label>
            <input
              aria-label="Full Name"
              type="text"
              required
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Phone Number</label>
            <input
              aria-label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="+254 700 000000"
              className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Country</label>
            <select
              aria-label="Country"
              value={country}
              onChange={(e) => onCountryChange(e.target.value)}
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
              aria-label="Region"
              type="text"
              value={region}
              onChange={(e) => onRegionChange(e.target.value)}
              placeholder="Eldoret, Gulu, etc."
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
  )
}
