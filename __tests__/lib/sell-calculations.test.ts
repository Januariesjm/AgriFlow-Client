import { calculateSellEarnings } from "@/lib/calculations/checkout"

describe("Sell Earnings Calculations", () => {
  test("calculates correct gross, fee, transport cost, and net earnings for standard maize load", () => {
    // 220 USD per ton, 10 tons, 50 km distance
    const result = calculateSellEarnings(220, 10, 50)

    expect(result.grossEarnings).toBe(2200)
    expect(result.platformFee).toBe(44) // 2% of 2200
    expect(result.transportCostEstimate).toBe(75) // 10 * 50 * 0.15
    expect(result.netEarnings).toBe(2081) // 2200 - 44 - 75
  })

  test("handles zero quantity or zero distance", () => {
    const result = calculateSellEarnings(380, 0, 100)
    expect(result.grossEarnings).toBe(0)
    expect(result.platformFee).toBe(0)
    expect(result.transportCostEstimate).toBe(0)
    expect(result.netEarnings).toBe(0)
  })

  test("clamps negative inputs to 0", () => {
    const result = calculateSellEarnings(-100, -5, -20)
    expect(result.grossEarnings).toBe(0)
    expect(result.netEarnings).toBe(0)
  })
})
