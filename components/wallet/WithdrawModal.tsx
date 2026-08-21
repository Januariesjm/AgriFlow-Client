"use client"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (amount: number, method: "mobile_money" | "bank") => Promise<void>
  loading?: boolean
}

export default function WithdrawModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: WithdrawModalProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState<"mobile_money" | "bank">("mobile_money")

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = Number(withdrawAmount)
    await onSubmit(num, withdrawMethod)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-xl border border-border/40 p-6 space-y-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ArrowUpRight className="h-5 w-5 text-primary" />
          <span>Withdraw Funds</span>
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
              Withdrawal Amount (KES)
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 10000"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
              Disbursement Channel
            </label>
            <select
              value={withdrawMethod}
              onChange={(e) => setWithdrawMethod(e.target.value as "mobile_money" | "bank")}
              className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="mobile_money">Mobile Money</option>
              <option value="bank">Bank Transfer</option>
            </select>
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
              {loading ? "Processing..." : "Confirm Withdrawal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
