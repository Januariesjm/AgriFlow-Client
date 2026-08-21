"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Wallet, DollarSign, ArrowUpRight, ArrowDownLeft, CheckCircle2, AlertCircle, Send } from "lucide-react"

interface LedgerItem {
  id: string
  type: "credit" | "debit" | "withdrawal"
  amount: number
  desc: string
  date: string
}

interface Booking {
  status: string
  totalCost: number
}

import { useSession } from "@/lib/hooks/useSession"

export default function WarehouseWallet() {
  const { session } = useSession()

  // Wallet state
  const [balance, setBalance] = useState(420.0)
  const [lifetime, setLifetime] = useState(2140.0)
  const [ledgers, setLedgers] = useState<LedgerItem[]>([])

  // Dynamic calculation for escrows
  const [escrowBalance, setEscrowBalance] = useState(0)

  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [method, setMethod] = useState("Mobile Money (M-Pesa)")
  const [recipient, setRecipient] = useState("")
  const [withdrawing, setWithdrawing] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (session?.user) {
      loadWalletData(session.user.id)
    }
  }, [session])

  const loadWalletData = (userId: string) => {
    // 1. Load basic wallet
    const storedWallet = localStorage.getItem(`af_warehouse_wallet_${userId}`)
    let bal = 420.0
    let life = 2140.0
    let ledg: LedgerItem[] = []

    if (storedWallet) {
      const parsed = JSON.parse(storedWallet)
      bal = parsed.balance ?? 420.0
      life = parsed.lifetime ?? 2140.0
      ledg = parsed.ledgers ?? []
    } else {
      ledg = [
        { id: "w-l1", type: "credit", amount: 540.00, desc: "Completed storage lease payment BKG-b3", date: new Date(Date.now() - 86400000).toISOString() },
        { id: "w-l2", type: "withdrawal", amount: 300.00, desc: "Withdrawal to Commercial Bank Transfer", date: new Date(Date.now() - 172800000).toISOString() },
        { id: "w-l3", type: "credit", amount: 180.00, desc: "Completed storage lease payment BKG-X19", date: new Date(Date.now() - 259200000).toISOString() }
      ]
      localStorage.setItem(
        `af_warehouse_wallet_${userId}`,
        JSON.stringify({ balance: bal, lifetime: life, ledgers: ledg })
      )
    }

    setBalance(bal)
    setLifetime(life)
    setLedgers(ledg)

    // 2. Load active bookings to calculate escrows (pending, confirmed, checked_in total rental costs)
    const storedBookings = localStorage.getItem(`af_warehouse_bookings_${userId}`)
    if (storedBookings) {
      const bookingsList: Booking[] = JSON.parse(storedBookings)
      const escrows = bookingsList
        .filter((b) => ["pending", "confirmed", "checked_in"].includes(b.status))
        .reduce((sum, b) => sum + b.totalCost, 0)
      setEscrowBalance(escrows)
    }
  }

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const amount = Number(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please specify a valid positive amount.")
      return
    }

    if (amount > balance) {
      setError("Insufficient funds in available balance.")
      return
    }

    if (!recipient.trim()) {
      setError("Recipient account details are required.")
      return
    }

    setWithdrawing(true)

    setTimeout(() => {
      try {
        const newBalance = balance - amount
        const newLedger: LedgerItem = {
          id: `led-${Date.now()}`,
          type: "withdrawal",
          amount,
          desc: `Withdrawal via ${method} to ${recipient}`,
          date: new Date().toISOString()
        }

        const updatedLedgers = [newLedger, ...ledgers]

        if (session?.user) {
          localStorage.setItem(
            `af_warehouse_wallet_${session.user.id}`,
            JSON.stringify({ balance: newBalance, lifetime, ledgers: updatedLedgers })
          )
        }

        setBalance(newBalance)
        setLedgers(updatedLedgers)
        setSuccess(`Payout request of $${amount.toFixed(2)} processed successfully!`)
        setWithdrawAmount("")
        setRecipient("")
        setTimeout(() => setSuccess(""), 4000)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "An error occurred"
        setError(msg)
      } finally {
        setWithdrawing(false)
      }
    }, 1000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Wallet className="h-8 w-8 text-primary" />
          <span>Warehouse Payouts Wallet</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor your warehouse renting balances, inspect locked escrow holds for active check-ins, and withdraw rent instantly.
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

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-xl border border-primary/20 relative overflow-hidden">
          <span className="text-xs text-primary font-bold uppercase tracking-wider block">Available Rent Balance</span>
          <h3 className="text-3xl font-black text-white mt-1">${balance.toFixed(2)}</h3>
          <p className="text-xs text-muted-foreground mt-1">Cleared rentable earnings.</p>
          <div className="absolute top-4 right-4 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-amber-500/20 relative overflow-hidden">
          <span className="text-xs text-amber-500 font-bold uppercase tracking-wider block">Lease Escrows</span>
          <h3 className="text-3xl font-black text-white mt-1">${escrowBalance.toFixed(2)}</h3>
          <p className="text-xs text-muted-foreground mt-1">Held until lease completion checkout.</p>
          <div className="absolute top-4 right-4 h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">
            Esc
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-border/40 relative overflow-hidden">
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">Total Rent Revenues</span>
          <h3 className="text-3xl font-black text-white mt-1">${lifetime.toFixed(2)}</h3>
          <p className="text-xs text-muted-foreground mt-1">Accumulated lease totals.</p>
          <div className="absolute top-4 right-4 h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold">
            $$
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Withdraw cash */}
        <div className="glass p-8 rounded-xl lg:col-span-1 h-fit">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Withdraw Rent Revenues
          </h3>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Amount to Withdraw ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Payout Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none"
              >
                <option value="Mobile Money (M-Pesa)">Mobile Money (M-Pesa)</option>
                <option value="Mobile Money (MTN)">Mobile Money (MTN)</option>
                <option value="Bank Transfer">Commercial Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Recipient Details</label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Phone number or Bank Account"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={withdrawing}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3 rounded-lg text-sm transition-all cursor-pointer shadow disabled:opacity-50"
            >
              {withdrawing ? "Processing Payout..." : "Withdraw Funds"}
            </button>
          </form>
        </div>

        {/* Ledger logs */}
        <div className="glass p-8 rounded-xl lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white">Wallet Transaction Ledger</h3>

          {ledgers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No transactions recorded yet.</p>
          ) : (
            <div className="space-y-3.5">
              {ledgers.map((l) => (
                <div key={l.id} className="flex justify-between items-center bg-slate-900/60 p-4 rounded-lg border border-border/30">
                  <div className="flex items-center space-x-3.5">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                      l.type === "withdrawal"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-green-500/10 text-green-400"
                    }`}>
                      {l.type === "withdrawal" ? (
                        <ArrowDownLeft className="h-4.5 w-4.5" />
                      ) : (
                        <ArrowUpRight className="h-4.5 w-4.5" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{l.desc}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(l.date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-black ${
                      l.type === "withdrawal" ? "text-red-400" : "text-green-400"
                    }`}>
                      {l.type === "withdrawal" ? "-" : "+"}${l.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
