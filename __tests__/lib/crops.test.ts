import {
  SOIL_TYPES,
  REGIONS,
  WATER_SOURCES,
  CROP_DATABASE,
  getRecommendedCrops,
} from "@/lib/data/crops"

describe("Crops Data & Recommendation Utility", () => {
  test("exports populated crop database and filter options", () => {
    expect(SOIL_TYPES.length).toBeGreaterThan(0)
    expect(REGIONS.length).toBeGreaterThan(0)
    expect(WATER_SOURCES.length).toBeGreaterThan(0)
    expect(CROP_DATABASE.length).toBeGreaterThan(0)
  })

  test("returns matching crops for Central Kenya loamy rainfed parameters", () => {
    const recommendations = getRecommendedCrops("loamy", "central_kenya", "rainfed")

    expect(recommendations.length).toBeGreaterThan(0)
    expect(recommendations.some((c) => c.name === "Maize")).toBe(true)
  })

  test("falls back gracefully to soil matches when specific combination has no exact match", () => {
    const recommendations = getRecommendedCrops("clayey", "kigali_rwanda", "rainfed")

    expect(recommendations.length).toBeGreaterThan(0)
    expect(recommendations.every((c) => c.soils.includes("clayey"))).toBe(true)
  })
})
