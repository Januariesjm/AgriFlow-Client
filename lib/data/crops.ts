export interface SoilType {
  id: string
  name: string
  desc: string
}

export interface RegionDef {
  id: string
  name: string
  country: string
  typicalRainfall: string
}

export interface WaterSourceDef {
  id: string
  name: string
  desc: string
}

export interface CropRecommendation {
  name: string
  category: string
  soils: string[]
  regions: string[]
  waters: string[]
  daysToHarvest: number
  demand: string
  margin: number
  avgPrice: number
  rationale: string
}

export const SOIL_TYPES: SoilType[] = [
  { id: "loamy", name: "Loamy Soil", desc: "Rich in nutrients, ideal drainage. Perfect for most crops." },
  { id: "clayey", name: "Clayey Soil", desc: "Retains water well, dense. Best for water-loving crops." },
  { id: "sandy", name: "Sandy Soil", desc: "Fast draining, warm. Requires irrigation, good for root crops." },
]

export const REGIONS: RegionDef[] = [
  { id: "central_kenya", name: "Central Kenya", country: "Kenya", typicalRainfall: "Moderate-High" },
  { id: "eastern_uganda", name: "Eastern Uganda", country: "Uganda", typicalRainfall: "High" },
  { id: "northern_tanzania", name: "Northern Tanzania", country: "Tanzania", typicalRainfall: "Low-Moderate" },
  { id: "kigali_rwanda", name: "Kigali Province", country: "Rwanda", typicalRainfall: "Moderate" },
]

export const WATER_SOURCES: WaterSourceDef[] = [
  { id: "rainfed", name: "Rain-fed Agriculture", desc: "Dependent entirely on seasonal rainfall cycles" },
  { id: "drip", name: "Drip / Sprinkler Irrigation", desc: "Controlled, optimized water supply" },
  { id: "borehole", name: "Borehole / Flood Irrigation", desc: "High water supply availability" },
]

export const CROP_DATABASE: CropRecommendation[] = [
  {
    name: "Maize",
    category: "Grains",
    soils: ["loamy", "clayey"],
    regions: ["central_kenya", "eastern_uganda"],
    waters: ["rainfed", "drip", "borehole"],
    daysToHarvest: 120,
    demand: "High",
    margin: 68,
    avgPrice: 220,
    rationale:
      "High regional corn demand. High nitrogen soil matches loamy/clayey structures. Rain-fed fits seasonal cycles in Eastern Uganda perfectly.",
  },
  {
    name: "Beans (Legumes)",
    category: "Legumes",
    soils: ["loamy", "sandy"],
    regions: ["central_kenya", "northern_tanzania", "kigali_rwanda"],
    waters: ["rainfed", "drip"],
    daysToHarvest: 90,
    demand: "High",
    margin: 75,
    avgPrice: 380,
    rationale:
      "Legumes enrich sandy/loamy soil nitrogen levels. Fast 90-day cycle matches short rain patterns in Northern Tanzania.",
  },
  {
    name: "Tomatoes",
    category: "Vegetables",
    soils: ["loamy"],
    regions: ["central_kenya", "kigali_rwanda"],
    waters: ["drip", "borehole"],
    daysToHarvest: 75,
    demand: "High",
    margin: 80,
    avgPrice: 280,
    rationale:
      "Vegetables yield high margins when drip-irrigated in Central Kenya. Short growing cycle means quick cash flow.",
  },
  {
    name: "Rice (Upland)",
    category: "Grains",
    soils: ["clayey"],
    regions: ["eastern_uganda", "northern_tanzania"],
    waters: ["borehole", "drip"],
    daysToHarvest: 150,
    demand: "Medium",
    margin: 55,
    avgPrice: 490,
    rationale:
      "Clayey water-retention traits are critical. Highly profitable under controlled borehole or flood irrigation.",
  },
  {
    name: "Onions",
    category: "Vegetables",
    soils: ["sandy", "loamy"],
    regions: ["northern_tanzania", "central_kenya"],
    waters: ["drip", "borehole"],
    daysToHarvest: 110,
    demand: "Medium",
    margin: 64,
    avgPrice: 320,
    rationale:
      "Sandy well-draining soils prevent bulb rot. Strong price index in Nairobi/Arusha wholesale markets.",
  },
  {
    name: "Irish Potatoes",
    category: "Tubers",
    soils: ["sandy", "loamy"],
    regions: ["central_kenya", "kigali_rwanda"],
    waters: ["rainfed", "drip"],
    daysToHarvest: 105,
    demand: "High",
    margin: 70,
    avgPrice: 310,
    rationale:
      "Loamy/sandy soil enables unrestricted tuber expansion. Excellent cool weather suitability in mountainous Central Kenya.",
  },
  {
    name: "Cassava",
    category: "Tubers",
    soils: ["sandy"],
    regions: ["northern_tanzania", "eastern_uganda"],
    waters: ["rainfed"],
    daysToHarvest: 270,
    demand: "Medium",
    margin: 50,
    avgPrice: 190,
    rationale:
      "Extremely drought-tolerant. Performs exceptionally in poor sandy soil under simple rain-fed parameters.",
  },
]

export function getRecommendedCrops(
  soil: string,
  region: string,
  water: string
): CropRecommendation[] {
  const filtered = CROP_DATABASE.filter(
    (crop) => crop.soils.includes(soil) && crop.regions.includes(region) && crop.waters.includes(water)
  )

  // Fallback to soil match if empty to keep recommendations interactive
  if (filtered.length === 0) {
    return CROP_DATABASE.filter((crop) => crop.soils.includes(soil)).slice(0, 2)
  }

  return filtered
}
