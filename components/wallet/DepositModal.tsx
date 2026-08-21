"use client"

import { useState } from "react"
import { Smartphone } from "lucide-react"

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (amount: number, phone: string) => Promise<void>
  loading?: boolean
}

export default function DepositModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: DepositModalProps) {
  const [depositAmount, setDepositAmount] = useState("")
  const [depositPhone, setDepositPhone] = useState("")

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = Number(depositAmount)
    await onSubmit(num, depositPhone)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-xl border border-border/40 p-6 space-y-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-emerald-400" />
          <span>M-PESA Express Deposit</span>
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
              Deposit Amount (KES)
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 5000"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
              M-PESA Phone Number
            </label>
            <input
              type="text"
              required
              placeholder="+254712345678"
              value={depositPhone}
              onChange={(e) => setDepositPhone(e.target.value)}
              className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-xs font-semibold text-muted-foreground rounded-lg hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95"
            >
              {loading ? "Sending Prompt..." : "Send M-PESA STK Push"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
