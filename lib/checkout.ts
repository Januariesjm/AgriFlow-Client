/**
 * Helper functions for product checkout and transport landed cost calculations.
 */

export function calculateCropTotal(pricePerUnit: number, quantity: number): number {
  if (isNaN(pricePerUnit) || isNaN(quantity) || quantity < 0 || pricePerUnit < 0) {
    return 0
  }
  return Math.round(pricePerUnit * quantity * 100) / 100
}

export function calculateLandedCost(
  pricePerUnit: number,
  quantity: number,
  transportCost: number | null
): number {
  const cropTotal = calculateCropTotal(pricePerUnit, quantity)
  const shipping = transportCost && !isNaN(transportCost) && transportCost >= 0 ? transportCost : 0
  return Math.round((cropTotal + shipping) * 100) / 100
}

export function buildTransportCostQueryParams(
  fromLat: number | string,
  fromLng: number | string,
  toLat: string,
  toLng: string,
  weight: number,
  vehicleType: string = "truck"
): URLSearchParams {
  return new URLSearchParams({
    from_lat: String(fromLat),
    from_lng: String(fromLng),
    to_lat: String(toLat),
    to_lng: String(toLng),
    weight: String(weight),
    vehicle_type: vehicleType,
  })
}
