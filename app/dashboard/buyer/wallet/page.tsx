"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Wallet, Shield, Landmark, ArrowDownLeft, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"

interface Deposit {
  id: string
  amount: number
  method: string
  reference: string
  status: string
  created_at: string
}

export default function BuyerWallet() {
  const [session, setSession] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState("")
  const [depositMethod, setDepositMethod] = useState("bank") // bank or mobile_money
  const [mobileProvider, setMobileProvider] = useState("M-Pesa")
  const [mobilePhone, setMobilePhone] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [totalDeposited, setTotalDeposited] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchOrders(session.access_token)
        
        // Load deposits from localStorage
        const storedDeposits = localStorage.getItem(`af_buyer_deposits_${session.user.id}`)
        if (storedDeposits) {
          const parsed = JSON.parse(storedDeposits)
          setDeposits(parsed)
          const sum = parsed.reduce((total: number, item: any) => total + Number(item.amount), 0)
          setTotalDeposited(sum)
        } else {
          // Default starting funds for rich UX
          const initialDeposits = [
            {
              id: "DEP-981245",
              amount: 5000,
              method: "Bank Transfer (Equity Bank)",
              reference: "REF-OB-491024",
              status: "completed",
              created_at: new Date(Date.now() - 86400000 * 2).toISOString()
            }
          ]
          setDeposits(initialDeposits)
          setTotalDeposited(5000)
          localStorage.setItem(`af_buyer_deposits_${session.user.id}`, JSON.stringify(initialDeposits))
        }
      }
    })
  }, [])

  const fetchOrders = async (token: string) => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:4000/api/orders?role=buyer", {
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
  // Escrow funds: orders that are pending, confirmed, or in_transit
  const totalEscrow = orders
    .filter((o) => ["pending", "confirmed", "in_transit"].includes(o.status))
    .reduce((sum, o) => sum + (o.total_price || 0), 0)

  // Lifetime spent: orders that are delivered
  const totalSpent = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (o.total_price || 0), 0)

  // Available balance: total deposits minus lifetime spent minus held in escrow
  const availableBalance = Math.max(0, totalDeposited - totalSpent - totalEscrow)

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const amount = Number(depositAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid deposit amount.")
      return
    }

    const refId = `DEP-${Math.floor(100000 + Math.random() * 900000)}`
    const newDeposit: Deposit = {
      id: refId,
      amount,
      method: depositMethod === "mobile_money" ? `Mobile Money (${mobileProvider})` : `Bank Transfer (${bankName || "Equity Bank"})`,
      reference: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      status: "completed", // Instantly completed simulation
      created_at: new Date().toISOString()
    }

    const updatedDeposits = [newDeposit, ...deposits]
    setDeposits(updatedDeposits)
    setTotalDeposited(totalDeposited + amount)
    setDepositAmount("")
    
    if (session?.user) {
      localStorage.setItem(`af_buyer_deposits_${session.user.id}`, JSON.stringify(updatedDeposits))
    }

    setSuccess(`Successfully funded your wallet with $${amount.toFixed(2)}!`)
    setTimeout(() => setSuccess(""), 5000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Wallet className="h-8 w-8 text-primary" />
          <span>My Procurement Wallet & Escrows</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Top up sourcing capital, review funds locked in secure escrow, and track corporate trade payments.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Balance */}
        <div className="glass p-6 rounded-xl border border-primary/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-primary font-bold uppercase tracking-wider">Available Capital</span>
              <h3 className="text-3xl font-black text-white">${availableBalance.toFixed(2)}</h3>
              <p className="text-xs text-muted-foreground mt-1">Cleared funds ready to buy commodities.</p>
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
              <p className="text-xs text-muted-foreground mt-1">Secured payments locked until delivery.</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/40 via-amber-500 to-amber-500/40" />
        </div>

        {/* Lifetime Spent */}
        <div className="glass p-6 rounded-xl border border-border/40 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Lifetime Procurement</span>
              <h3 className="text-3xl font-black text-white">${totalSpent.toFixed(2)}</h3>
              <p className="text-xs text-muted-foreground mt-1">Total completed trade value.</p>
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
        {/* Deposit Capital */}
        <div className="glass p-8 rounded-xl">
          <div className="flex items-center space-x-2.5 mb-6">
            <Landmark className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold text-white">Deposit Sourcing Capital</h3>
          </div>

          <form onSubmit={handleDeposit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Funding Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDepositMethod("bank")}
                  className={`py-2 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    depositMethod === "bank"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-slate-900 border-border text-muted-foreground hover:text-white"
                  }`}
                >
                  Bank Wire Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setDepositMethod("mobile_money")}
                  className={`py-2 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    depositMethod === "mobile_money"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-slate-900 border-border text-muted-foreground hover:text-white"
                  }`}
                >
                  Mobile Money
                </button>
              </div>
            </div>

            {depositMethod === "mobile_money" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Provider Network</label>
                  <select
                    value={mobileProvider}
                    onChange={(e) => setMobileProvider(e.target.value)}
                    className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
                  >
                    <option value="M-Pesa">Safaricom M-Pesa</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="MTN Momo">MTN Momo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={mobilePhone}
                    onChange={(e) => setMobilePhone(e.target.value)}
                    placeholder="+254 712 345678"
                    className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Equity Bank / KCB"
                    className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Origin Account Number</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1209348123901"
                    className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Amount to Fund ($ USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-muted-foreground text-sm font-bold">$</span>
                <input
                  type="number"
                  step="1"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                  placeholder="1000"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3 rounded-lg text-sm transition-all cursor-pointer shadow"
            >
              Deposit Sourcing Funds
            </button>
          </form>
        </div>

        {/* Info box */}
        <div className="glass p-8 rounded-xl flex flex-col justify-between border border-primary/10">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">How Escrow Protection Works</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              AgriFlow enforces full buyer protection via secure smart escrows. When you order a commodity, the total price is debited from your Available Capital and placed in Escrow.
            </p>
            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-2 mb-4">
              <li>Farmers are notified once funds are secured in escrow.</li>
              <li>Sellers process and dispatch the harvest.</li>
              <li>Logistics tracking maps the transporter's location.</li>
              <li>Once you confirm receipt at your warehouse, the escrowed funds are released to the supplier.</li>
              <li>If you cancel a pending order, the funds are immediately refunded to your wallet.</li>
            </ul>
          </div>
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-xs text-muted-foreground leading-relaxed">
            Need higher transaction limits? Contact your account executive to request credit configurations.
          </div>
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
        ) : orders.length === 0 && deposits.length === 0 ? (
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
                {/* Deposits */}
                {deposits.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-white">{d.id}</td>
                    <td className="py-3.5 px-4 text-xs">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-medium text-white block">Capital Deposit</span>
                      <span className="text-[10px] text-muted-foreground">{d.method}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-green-400">
                      +${Number(d.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}

                {/* Orders */}
                {orders.map((o) => {
                  const isDelivered = o.status === "delivered"
                  const isCancelled = o.status === "cancelled"

                  return (
                    <tr key={o.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-white">ORD-{o.id.substring(0, 8).toUpperCase()}</td>
                      <td className="py-3.5 px-4 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-medium text-white block">Sourcing payment: {o.product?.name}</span>
                        <span className="text-[10px] text-muted-foreground">Supplier: {o.farmer?.full_name}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          isDelivered 
                            ? "bg-green-500/10 border-green-500/20 text-green-400" 
                            : isCancelled 
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                        }`}>
                          {isDelivered ? "Released" : isCancelled ? "Refunded" : "Escrowed"}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold ${isCancelled ? "text-green-400" : "text-destructive"}`}>
                        {isCancelled ? `+$${Number(o.total_price).toFixed(2)}` : `-$${Number(o.total_price).toFixed(2)}`}
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
