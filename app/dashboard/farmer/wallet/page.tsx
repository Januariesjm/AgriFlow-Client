"use client"

import { useState } from "react"
import { useWallet } from "@/lib/hooks/useWallet"
import { Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, CheckCircle2, AlertCircle, Shield, Building, Smartphone, FileText } from "lucide-react"

export default function FarmerWallet() {
  const {
    balance,
    withdrawals,
    deposits,
    payoutConfig,
    setPayoutConfig,
    loading,
    msg,
    fetchWalletData,
    requestWithdrawal,
    initiateDeposit,
    savePayoutConfig,
  } = useWallet()

  // Modal States
  const [withdrawModal, setWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState<"mobile_money" | "bank">("mobile_money")
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  const [depositModal, setDepositModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [depositPhone, setDepositPhone] = useState("")
  const [depositLoading, setDepositLoading] = useState(false)

  const [configSaving, setConfigSaving] = useState(false)

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setWithdrawLoading(true)
    const success = await requestWithdrawal(parseFloat(withdrawAmount), withdrawMethod)
    setWithdrawLoading(false)
    if (success) {
      setWithdrawModal(false)
      setWithdrawAmount("")
    }
  }

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDepositLoading(true)
    const success = await initiateDeposit(parseFloat(depositAmount), depositPhone)
    setDepositLoading(false)
    if (success) {
      setDepositModal(false)
      setDepositAmount("")
    }
  }

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setConfigSaving(true)
    await savePayoutConfig(payoutConfig)
    setConfigSaving(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Wallet className="h-8 w-8 text-primary" />
            <span>Escrow & Digital Wallet</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage payouts, track sales escrow balances, and trigger immediate M-PESA or bank withdrawals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchWalletData}
            disabled={loading}
            className="p-2.5 bg-slate-900 border border-border/40 hover:bg-slate-800 rounded-lg text-muted-foreground hover:text-white transition-all cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setDepositModal(true)}
            className="bg-slate-900 hover:bg-slate-800 border border-border/40 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
            <span>Deposit Funds</span>
          </button>
          <button
            onClick={() => setWithdrawModal(true)}
            className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Withdraw Payout</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {msg && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
          msg.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-destructive/10 border-destructive/30 text-destructive"
        }`}>
          {msg.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span className="text-sm font-semibold">{msg.text}</span>
        </div>
      )}

      {/* Balance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-xl border border-emerald-500/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">Available for Cashout</span>
              <h3 className="text-4xl font-black text-white mt-2">
                KES {balance.available.toLocaleString()}
              </h3>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span>Cleared escrow funds ready for immediate disbursement.</span>
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-amber-500/20 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">Pending Escrow Hold</span>
              <h3 className="text-4xl font-black text-white mt-2">
                KES {balance.pending.toLocaleString()}
              </h3>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-amber-400" />
                <span>In-transit orders awaiting buyer receipt verification.</span>
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Payout Config & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payout Config Form */}
        <div className="glass p-6 rounded-xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            <span>Disbursement Settlement Settings</span>
          </h2>
          <form onSubmit={handleConfigSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Preferred Settlement Channel</label>
              <select
                value={payoutConfig.payoutMethod}
                onChange={(e) => setPayoutConfig({ ...payoutConfig, payoutMethod: e.target.value as "mobile_money" | "bank" })}
                className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="mobile_money">Mobile Money (M-PESA / Airtel Money)</option>
                <option value="bank">Commercial Bank Transfer</option>
              </select>
            </div>

            {payoutConfig.payoutMethod === "mobile_money" ? (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Provider</label>
                  <input
                    type="text"
                    value={payoutConfig.mobileProvider}
                    onChange={(e) => setPayoutConfig({ ...payoutConfig, mobileProvider: e.target.value })}
                    className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Registered Phone Number</label>
                  <input
                    type="text"
                    placeholder="+254712345678"
                    value={payoutConfig.mobilePhone}
                    onChange={(e) => setPayoutConfig({ ...payoutConfig, mobilePhone: e.target.value })}
                    className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. KCB Bank / Equity"
                    value={payoutConfig.bankName}
                    onChange={(e) => setPayoutConfig({ ...payoutConfig, bankName: e.target.value })}
                    className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={payoutConfig.accountName}
                    onChange={(e) => setPayoutConfig({ ...payoutConfig, accountName: e.target.value })}
                    className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Account Number</label>
                  <input
                    type="text"
                    value={payoutConfig.accountNumber}
                    onChange={(e) => setPayoutConfig({ ...payoutConfig, accountNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={configSaving}
              className="w-full bg-slate-900 border border-border hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs transition-all cursor-pointer"
            >
              {configSaving ? "Saving Settings..." : "Save Settlement Details"}
            </button>
          </form>
        </div>

        {/* Transaction Ledgers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-xl space-y-4">
            <h3 className="text-base font-bold text-white">Withdrawal Disburse History</h3>
            {withdrawals.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No withdrawal history available.</p>
            ) : (
              <div className="space-y-2">
                {withdrawals.map((w) => (
                  <div key={w.id} className="bg-slate-900/60 p-3 rounded-lg border border-border/40 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-white font-semibold">KES {w.amount.toLocaleString()}</span>
                      <span className="text-muted-foreground block text-[10px]">{w.destination} • {new Date(w.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass p-6 rounded-xl space-y-4">
            <h3 className="text-base font-bold text-white">Inbound Deposit & Escrow Ledger</h3>
            {deposits.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No deposit records found.</p>
            ) : (
              <div className="space-y-2">
                {deposits.map((d) => (
                  <div key={d.id} className="bg-slate-900/60 p-3 rounded-lg border border-border/40 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-white font-semibold">KES {d.amount.toLocaleString()}</span>
                      <span className="text-muted-foreground block text-[10px]">Ref: {d.reference} • {new Date(d.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {withdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-xl border border-border/40 p-6 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-primary" />
              <span>Withdraw Funds</span>
            </h3>
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Withdrawal Amount (KES)</label>
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
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Disbursement Channel</label>
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
                  onClick={() => setWithdrawModal(false)}
                  className="px-4 py-2 bg-slate-900 text-xs font-semibold text-muted-foreground rounded-lg hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95"
                >
                  {withdrawLoading ? "Processing..." : "Confirm Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-xl border border-border/40 p-6 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-emerald-400" />
              <span>M-PESA Express Deposit</span>
            </h3>
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Deposit Amount (KES)</label>
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
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">M-PESA Phone Number</label>
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
                  onClick={() => setDepositModal(false)}
                  className="px-4 py-2 bg-slate-900 text-xs font-semibold text-muted-foreground rounded-lg hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depositLoading}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95"
                >
                  {depositLoading ? "Sending Prompt..." : "Send M-PESA STK Push"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
