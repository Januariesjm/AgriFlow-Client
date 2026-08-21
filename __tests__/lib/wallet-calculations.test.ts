import {
  calculateWalletSummary,
  validateWithdrawalRequest,
  calculateDepositFee,
} from "@/lib/calculations/wallet"

describe("Wallet Calculation Utilities", () => {
  describe("calculateWalletSummary", () => {
    test("correctly sums available, locked, and pending balances", () => {
      const result = calculateWalletSummary(50000, 10000, 5000)
      expect(result).toEqual({
        available: 50000,
        locked: 10000,
        pending: 5000,
        total: 65000,
      })
    })

    test("handles negative inputs gracefully by clamping to 0", () => {
      const result = calculateWalletSummary(-500, 1000, -200)
      expect(result).toEqual({
        available: 0,
        locked: 1000,
        pending: 0,
        total: 1000,
      })
    })
  })

  describe("validateWithdrawalRequest", () => {
    test("approves valid withdrawal amount within available balance", () => {
      const result = validateWithdrawalRequest(2500, 10000)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    test("rejects withdrawal below minimum limit", () => {
      const result = validateWithdrawalRequest(50, 10000, 100)
      expect(result.valid).toBe(false)
      expect(result.error).toContain("Minimum withdrawal amount")
    })

    test("rejects withdrawal exceeding available balance", () => {
      const result = validateWithdrawalRequest(15000, 10000)
      expect(result.valid).toBe(false)
      expect(result.error).toContain("exceeds available balance")
    })

    test("rejects zero or negative withdrawal amount", () => {
      const result = validateWithdrawalRequest(0, 10000)
      expect(result.valid).toBe(false)
      expect(result.error).toContain("must be greater than 0")
    })
  })

  describe("calculateDepositFee", () => {
    test("calculates correct 1% deposit fee", () => {
      expect(calculateDepositFee(5000)).toBe(50)
      expect(calculateDepositFee(1250)).toBe(12.5)
    })

    test("returns 0 for non-positive deposit amount", () => {
      expect(calculateDepositFee(0)).toBe(0)
      expect(calculateDepositFee(-100)).toBe(0)
    })
  })
})
