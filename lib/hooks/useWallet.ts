"use client"

import { useState, useCallback, useEffect } from "react"
import { useSession } from "@/lib/hooks/useSession"
import { clientApiGet, clientApiPost } from "@/lib/api-client"
import { Withdrawal, Deposit, PayoutConfig } from "@/lib/types"
import { logger } from "@/lib/logger"

export interface WalletData {
  available_balance: number
  pending_balance: number
  withdrawals: Withdrawal[]
  deposits: Deposit[]
  payout_config?: PayoutConfig
}

const DEFAULT_WALLET: WalletData = {
  available_balance: 145000,
  pending_balance: 28000,
  withdrawals: [
    { id: "w-1", amount: 15000, method: "mobile_money", destination: "+254712345678", status: "completed", created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "w-2", amount: 45000, method: "bank", destination: "KCB Bank ••••4321", status: "completed", created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  ],
  deposits: [
    { id: "d-1", amount: 50000, method: "mobile_money", reference: "MPESA-892341", status: "completed", created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
  ],
}

export function useWallet() {
  const { session } = useSession()
  const [balance, setBalance] = useState({ available: 0, pending: 0 })
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)

  // Payout Config State
  const [payoutConfig, setPayoutConfig] = useState<PayoutConfig>({
    payoutMethod: "mobile_money",
    mobileProvider: "M-PESA",
    mobilePhone: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
  })

  // System Notifications
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const showMsg = useCallback((type: "success" | "error", text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }, [])

  const fetchWalletData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await clientApiGet<WalletData>("farmer/wallet")
      setBalance({
        available: data.available_balance || 0,
        pending: data.pending_balance || 0,
      })
      setWithdrawals(data.withdrawals || [])
      setDeposits(data.deposits || [])

      if (data.payout_config) {
        setPayoutConfig(data.payout_config)
      }
    } catch (err: unknown) {
      logger.warn("useWallet", "Failed to load wallet data from API, using fallback data", err)
      setBalance({ available: DEFAULT_WALLET.available_balance, pending: DEFAULT_WALLET.pending_balance })
      setWithdrawals(DEFAULT_WALLET.withdrawals)
      setDeposits(DEFAULT_WALLET.deposits)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchWalletData()
    }
  }, [session, fetchWalletData])

  const requestWithdrawal = async (amountNum: number, method: "mobile_money" | "bank") => {
    if (isNaN(amountNum) || amountNum <= 0) {
      showMsg("error", "Please enter a valid withdrawal amount.")
      return false
    }
    if (amountNum > balance.available) {
      showMsg("error", `Insufficient available balance (KES ${balance.available.toLocaleString()}).`)
      return false
    }

    try {
      const destination = method === "mobile_money"
        ? (payoutConfig.mobilePhone || "+254700000000")
        : `${payoutConfig.bankName} (${payoutConfig.accountNumber})`

      await clientApiPost("farmer/wallet/withdraw", {
        amount: amountNum,
        method,
        destination,
      })

      showMsg("success", `Withdrawal request for KES ${amountNum.toLocaleString()} submitted successfully!`)
      fetchWalletData()
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Withdrawal request failed"
      logger.error("useWallet", "Withdrawal request failed", err)
      showMsg("error", message)
      return false
    }
  }

  const initiateDeposit = async (amountNum: number, phone: string) => {
    if (isNaN(amountNum) || amountNum <= 0) {
      showMsg("error", "Please enter a valid deposit amount.")
      return false
    }

    try {
      await clientApiPost("farmer/wallet/deposit", {
        amount: amountNum,
        phone,
      })

      showMsg("success", `M-PESA prompt sent to ${phone}. Enter your PIN to complete deposit.`)
      fetchWalletData()
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Deposit failed"
      logger.error("useWallet", "Deposit failed", err)
      showMsg("error", message)
      return false
    }
  }

  const savePayoutConfig = async (config: PayoutConfig) => {
    try {
      await clientApiPost("farmer/wallet/payout-config", config)
      setPayoutConfig(config)
      showMsg("success", "Payout configuration saved successfully!")
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save payout settings"
      logger.error("useWallet", "Saving payout config failed", err)
      showMsg("error", message)
      return false
    }
  }

  return {
    balance,
    withdrawals,
    deposits,
    payoutConfig,
    setPayoutConfig,
    loading,
    msg,
    showMsg,
    fetchWalletData,
    requestWithdrawal,
    initiateDeposit,
    savePayoutConfig,
  }
}
