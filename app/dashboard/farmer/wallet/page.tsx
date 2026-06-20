"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Wallet, Shield, Landmark, ArrowDownLeft, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"

export default function FarmerWallet() {
  const [session, setSession] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Payout Configuration
  const [payoutMethod, setPayoutMethod] = useState("mobile_money") // mobile_money or bank
  const [mobileProvider, setMobileProvider] = useState("M-Pesa")
  const [mobilePhone, setMobilePhone] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountName, setAccountName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)

  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [localWithdrawnAmount, setLocalWithdrawnAmount] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchOrders(session.access_token)
        // Load initial mock configuration if any from localStorage
        const storedConfig = localStorage.getItem(`af_payout_config_${session.user.id}`)
        if (storedConfig) {
          const parsed = JSON.parse(storedConfig)
          setPayoutMethod(parsed.payoutMethod || "mobile_money")
          setMobileProvider(parsed.mobileProvider || "M-Pesa")
          setMobilePhone(parsed.mobilePhone || "")
          setBankName(parsed.bankName || "")
          setAccountName(parsed.accountName || "")
          setAccountNumber(parsed.accountNumber || "")
          setIsConfigured(true)
        }
        // Load previous withdrawals
        const storedWithdrawals = localStorage.getItem(`af_withdrawals_${session.user.id}`)
        if (storedWithdrawals) {
          const parsed = JSON.parse(storedWithdrawals)
          setWithdrawals(parsed)
          const sum = parsed.reduce((total: number, item: any) => total + Number(item.amount), 0)
          setLocalWithdrawnAmount(sum)
        }
      }
    })
  }, [])

  const fetchOrders = async (token: string) => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:4000/api/orders?role=farmer", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate balances
  const totalEscrow = orders
    .filter((o) => ["pending", "confirmed", "in_transit"].includes(o.status))
    .reduce((sum, o) => sum + (o.total_price || 0), 0)

  const totalDelivered = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (o.total_price || 0), 0)

  // Available balance is delivered orders minus what has been withdrawn
  const availableBalance = Math.max(0, totalDelivered - localWithdrawnAmount)
  const lifetimeEarnings = totalDelivered

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) return

    const config = {
      payoutMethod,
      mobileProvider,
      mobilePhone,
      bankName,
      accountName,
      accountNumber,
    }
    localStorage.setItem(`af_payout_config_${session.user.id}`, JSON.stringify(config))
    setIsConfigured(true)
    setSuccess("Payout configuration saved successfully!")
    setTimeout(() => setSuccess(""), 4000)
  }

  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!isConfigured) {
      setError("Please configure your payout method first.")
      return
    }

    const amount = Number(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid positive withdrawal amount.")
      return
    }

    if (amount > availableBalance) {
      setError("Insufficient available balance for this withdrawal.")
      return
    }

    // Add withdrawal request
    const newRequest = {
      id: `WTH-${Math.floor(100000 + Math.random() * 900000)}`,
      amount,
      method: payoutMethod === "mobile_money" ? `Mobile Money (${mobileProvider})` : `Bank Account (${bankName})`,
      destination: payoutMethod === "mobile_money" ? mobilePhone : accountNumber,
      status: "completed", // Auto-approved for simulation
      created_at: new Date().toISOString(),
    }

    const updatedWithdrawals = [newRequest, ...withdrawals]
    setWithdrawals(updatedWithdrawals)
    const newSum = localWithdrawnAmount + amount
    setLocalWithdrawnAmount(newSum)
    setWithdrawAmount("")

    if (session?.user) {
      localStorage.setItem(`af_withdrawals_${session.user.id}`, JSON.stringify(updatedWithdrawals))
    }

    setSuccess(`Successfully withdrew $${amount.toFixed(2)} to your payout account!`)
    setTimeout(() => setSuccess(""), 5000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Wallet className="h-8 w-8 text-primary" />
          <span>My Earnings & Wallet</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor your earnings, view funds held in escrow, and withdraw your cleared funds.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available for Withdrawal */}
        <div className="glass p-6 rounded-xl border border-primary/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-primary font-bold uppercase tracking-wider">Available for Withdrawal</span>
              <h3 className="text-3xl font-black text-white">${availableBalance.toFixed(2)}</h3>
              <p className="text-xs text-muted-foreground mt-1">Cleared funds from completed deliveries.</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowDownLeft className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
        </div>

        {/* Escrow Balance */}
        <div className="glass p-6 rounded-xl border border-amber-500/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-amber-500 font-bold uppercase tracking-wider">Held in Escrow</span>
              <h3 className="text-3xl font-black text-white">${totalEscrow.toFixed(2)}</h3>
              <p className="text-xs text-muted-foreground mt-1">Locked until buyers confirm receipt.</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/40 via-amber-500 to-amber-500/40" />
        </div>

        {/* Lifetime Earnings */}
        <div className="glass p-6 rounded-xl border border-border/40 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Lifetime Cleared</span>
              <h3 className="text-3xl font-black text-white">${lifetimeEarnings.toFixed(2)}</h3>
              <p className="text-xs text-muted-foreground mt-1">Total revenue generated historically.</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/40" />
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Withdraw Funds */}
        <div className="glass p-8 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-6">
              <Wallet className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-white">Withdrawal Request</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Transfer cleared funds directly to your pre-configured mobile money or bank account. Withdrawals are processed instantly.
            </p>

            <form onSubmit={handleRequestWithdrawal} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Amount to Withdraw ($ USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-muted-foreground text-sm font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    disabled={availableBalance <= 0}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-border rounded-lg pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary disabled:opacity-50"
                    placeholder="0.00"
                  />
                </div>
                {availableBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(availableBalance.toFixed(2))}
                    className="text-xs text-primary hover:underline mt-1.5"
                  >
                    Withdraw maximum (${availableBalance.toFixed(2)})
                  </button>
                )}
              </div>

              {isConfigured ? (
                <div className="p-3 bg-slate-900 border border-border/40 rounded-lg text-xs space-y-1">
                  <span className="text-muted-foreground block font-semibold">Active Destination Account:</span>
                  <span className="text-white block">
                    {payoutMethod === "mobile_money" 
                      ? `${mobileProvider}: ${mobilePhone}` 
                      : `${bankName} (Acc: ${accountNumber})`}
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-xs leading-relaxed">
                  Please configure your payout credentials in the setup panel first to initiate a withdrawal.
                </div>
              )}

              <button
                type="submit"
                disabled={availableBalance <= 0 || !isConfigured}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3 rounded-lg text-sm transition-all cursor-pointer shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Withdraw Funds
              </button>
            </form>
          </div>
        </div>

        {/* Payout Credentials */}
        <div className="glass p-8 rounded-xl">
          <div className="flex items-center space-x-2.5 mb-6">
            <Landmark className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold text-white">Payout Configuration</h3>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Preferred Payout Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPayoutMethod("mobile_money")}
                  className={`py-2 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    payoutMethod === "mobile_money"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-slate-900 border-border text-muted-foreground hover:text-white"
                  }`}
                >
                  Mobile Money
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutMethod("bank")}
                  className={`py-2 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    payoutMethod === "bank"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-slate-900 border-border text-muted-foreground hover:text-white"
                  }`}
                >
                  Bank Transfer
                </button>
              </div>
            </div>

            {payoutMethod === "mobile_money" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Provider Network</label>
                  <select
                    value={mobileProvider}
                    onChange={(e) => setMobileProvider(e.target.value)}
                    className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="M-Pesa">Safaricom M-Pesa</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="MTN Momo">MTN Mobile Money</option>
                    <option value="Tigo Pesa">Tigo Pesa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Registered Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={mobilePhone}
                    onChange={(e) => setMobilePhone(e.target.value)}
                    placeholder="+254 700 000000"
                    className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Equity Bank, KCB, etc."
                    className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Account Number</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1234567890"
                    className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700/80 border border-border text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
            >
              Save Configuration
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="glass rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Financial Transaction Ledger</h3>
          <button
            onClick={() => session && fetchOrders(session.access_token)}
            className="text-xs text-muted-foreground hover:text-white flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reload Listings</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
          </div>
        ) : orders.length === 0 && withdrawals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transaction activity recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {/* Withdrawals */}
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-white">{w.id}</td>
                    <td className="py-3.5 px-4 text-xs">{new Date(w.created_at).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-medium text-white block">Withdrawal to payout account</span>
                      <span className="text-[10px] text-muted-foreground">{w.method}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-destructive">
                      -${Number(w.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}

                {/* Orders */}
                {orders.map((o) => {
                  const isDelivered = o.status === "delivered"
                  const isCancelled = o.status === "cancelled"
                  if (isCancelled) return null

                  return (
                    <tr key={o.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-white">ORD-{o.id.substring(0, 8).toUpperCase()}</td>
                      <td className="py-3.5 px-4 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-medium text-white block">Payment for {o.product?.name}</span>
                        <span className="text-[10px] text-muted-foreground">Buyer: {o.buyer?.full_name}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          isDelivered 
                            ? "bg-green-500/10 border-green-500/20 text-green-400" 
                            : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                        }`}>
                          {isDelivered ? "Cleared" : "Escrowed"}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold ${isDelivered ? "text-green-400" : "text-amber-500"}`}>
                        +${Number(o.total_price).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
