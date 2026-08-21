export interface SellEarningsEstimate {
  grossEarnings: number
  platformFee: number
  transportCostEstimate: number
  netEarnings: number
}

/**
 * Calculates earnings breakdown for crop sales.
 * @param pricePerTon Price per ton in KES/USD
 * @param quantity Tonnage quantity
 * @param transportDistance Distance in kilometers
 * @param platformFeeRate Default platform commission fee (e.g. 0.02 = 2%)
 * @param transportRatePerTonKm Transport cost per ton per km (e.g. 0.15)
 */
export function calculateSellEarnings(
  pricePerTon: number,
  quantity: number,
  transportDistance: number,
  platformFeeRate = 0.02,
  transportRatePerTonKm = 0.15
): SellEarningsEstimate {
  const safePrice = Math.max(0, pricePerTon)
  const safeQty = Math.max(0, quantity)
  const safeDist = Math.max(0, transportDistance)

  const grossEarnings = safePrice * safeQty
  const platformFee = grossEarnings * platformFeeRate
  const transportCostEstimate = safeQty * safeDist * transportRatePerTonKm
  const netEarnings = Math.max(0, grossEarnings - platformFee - transportCostEstimate)

  return {
    grossEarnings: Math.round(grossEarnings * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    transportCostEstimate: Math.round(transportCostEstimate * 100) / 100,
    netEarnings: Math.round(netEarnings * 100) / 100,
  }
}
