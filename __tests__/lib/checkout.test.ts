import {
  calculateCropTotal,
  calculateLandedCost,
  buildTransportCostQueryParams,
} from "@/lib/checkout"

describe("lib/checkout", () => {
  describe("calculateCropTotal", () => {
    it("calculates total crop price correctly", () => {
      expect(calculateCropTotal(25.5, 4)).toBe(102)
      expect(calculateCropTotal(10.333, 3)).toBe(31)
    })

    it("handles invalid or negative input values safely", () => {
      expect(calculateCropTotal(-10, 5)).toBe(0)
      expect(calculateCropTotal(10, -5)).toBe(0)
      expect(calculateCropTotal(NaN, 5)).toBe(0)
    })
  })

  describe("calculateLandedCost", () => {
    it("combines crop total and transport shipping cost", () => {
      expect(calculateLandedCost(50, 2, 35.5)).toBe(135.5)
    })

    it("handles null or missing transport cost gracefully", () => {
      expect(calculateLandedCost(50, 2, null)).toBe(100)
    })
  })

  describe("buildTransportCostQueryParams", () => {
    it("builds correct URL query params string", () => {
      const params = buildTransportCostQueryParams(-1.286389, 36.817223, "-1.2921", "36.8219", 5)
      expect(params.get("from_lat")).toBe("-1.286389")
      expect(params.get("from_lng")).toBe("36.817223")
      expect(params.get("to_lat")).toBe("-1.2921")
      expect(params.get("to_lng")).toBe("36.8219")
      expect(params.get("weight")).toBe("5")
      expect(params.get("vehicle_type")).toBe("truck")
    })
  })
})
