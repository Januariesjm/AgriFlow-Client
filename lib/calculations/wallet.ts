export interface WalletBalanceSummary {
  available: number
  locked: number
  pending: number
  total: number
}

export interface WithdrawalValidationResult {
  valid: boolean
  error?: string
}

/**
 * Calculates net wallet summary numbers from raw balances.
 */
export function calculateWalletSummary(
  available = 0,
  locked = 0,
  pending = 0
): WalletBalanceSummary {
  const safeAvail = Math.max(0, available)
  const safeLocked = Math.max(0, locked)
  const safePending = Math.max(0, pending)
  return {
    available: safeAvail,
    locked: safeLocked,
    pending: safePending,
    total: safeAvail + safeLocked + safePending,
  }
}

/**
 * Validates whether a withdrawal amount is valid against current available balance.
 */
export function validateWithdrawalRequest(
  amount: number,
  availableBalance: number,
  minLimit = 100
): WithdrawalValidationResult {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: "Withdrawal amount must be greater than 0." }
  }
  if (amount < minLimit) {
    return { valid: false, error: `Minimum withdrawal amount is KES ${minLimit}.` }
  }
  if (amount > availableBalance) {
    return { valid: false, error: "Requested amount exceeds available balance." }
  }
  return { valid: true }
}

/**
 * Calculates STK push fee for mobile money deposits.
 */
export function calculateDepositFee(amount: number, feePercentage = 0.01): number {
  if (amount <= 0) return 0
  return Math.round(amount * feePercentage * 100) / 100
}
