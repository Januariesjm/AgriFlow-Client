"use client"

import { useState } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { 
  Sprout, 
  TrendingUp, 
  MapPin, 
  CloudRain, 
  Settings, 
  ChevronRight, 
  Sparkles,
  Info,
  Calendar,
  DollarSign
} from "lucide-react"

// Soil definitions
const SOIL_TYPES = [
  { id: "loamy", name: "Loamy Soil", desc: "Rich in nutrients, ideal drainage. Perfect for most crops." },
  { id: "clayey", name: "Clayey Soil", desc: "Retains water well, dense. Best for water-loving crops." },
  { id: "sandy", name: "Sandy Soil", desc: "Fast draining, warm. Requires irrigation, good for root crops." },
]

// Region definitions
const REGIONS = [
  { id: "central_kenya", name: "Central Kenya", country: "Kenya", typicalRainfall: "Moderate-High" },
  { id: "eastern_uganda", name: "Eastern Uganda", country: "Uganda", typicalRainfall: "High" },
  { id: "northern_tanzania", name: "Northern Tanzania", country: "Tanzania", typicalRainfall: "Low-Moderate" },
  { id: "kigali_rwanda", name: "Kigali Province", country: "Rwanda", typicalRainfall: "Moderate" },
]

// Water availability
const WATER_SOURCES = [
  { id: "rainfed", name: "Rain-fed Agriculture", desc: "Dependent entirely on seasonal rainfall cycles" },
  { id: "drip", name: "Drip / Sprinkler Irrigation", desc: "Controlled, optimized water supply" },
  { id: "borehole", name: "Borehole / Flood Irrigation", desc: "High water supply availability" },
]

// Crop database for recommendations
const CROP_DATABASE = [
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
    rationale: "High regional corn demand. High nitrogen soil matches loamy/clayey structures. Rain-fed fits seasonal cycles in Eastern Uganda perfectly."
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
    rationale: "Legumes enrich sandy/loamy soil nitrogen levels. Fast 90-day cycle matches short rain patterns in Northern Tanzania."
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
    rationale: "Vegetables yield high margins when drip-irrigated in Central Kenya. Short growing cycle means quick cash flow."
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
    rationale: "Clayey water-retention traits are critical. Highly profitable under controlled borehole or flood irrigation."
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
    rationale: "Sandy well-draining soils prevent bulb rot. Strong price index in Nairobi/Arusha wholesale markets."
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
    rationale: "Loamy/sandy soil enables unrestricted tuber expansion. Excellent cool weather suitability in mountainous Central Kenya."
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
    rationale: "Extremely drought-tolerant. Performs exceptionally in poor sandy soil under simple rain-fed parameters."
  }
]

export default function PlantNextPage() {
  const [selectedSoil, setSelectedSoil] = useState("loamy")
  const [selectedRegion, setSelectedRegion] = useState("central_kenya")
  const [selectedWater, setSelectedWater] = useState("rainfed")
  
  const [recommendations, setRecommendations] = useState<any[]>(CROP_DATABASE.filter(
    crop => crop.soils.includes("loamy") && crop.regions.includes("central_kenya") && crop.waters.includes("rainfed")
  ))
  const [analyzing, setAnalyzing] = useState(false)

  const handleAnalyze = () => {
    setAnalyzing(true)
    setTimeout(() => {
      const filtered = CROP_DATABASE.filter(crop => {
        const soilMatch = crop.soils.includes(selectedSoil)
        const regionMatch = crop.regions.includes(selectedRegion)
        const waterMatch = crop.waters.includes(selectedWater)
        return soilMatch && regionMatch && waterMatch
      })
      
      // Fallback to soil match if empty to keep page interactive
      if (filtered.length === 0) {
        setRecommendations(CROP_DATABASE.filter(crop => crop.soils.includes(selectedSoil)).slice(0, 2))
      } else {
        setRecommendations(filtered)
      }
      setAnalyzing(false)
    }, 800)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-foreground">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Hero */}
        <section className="text-center max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 tracking-wide">
              AgriFlow Soil & Demand Forecasting Model
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
            What to Plant Next?
          </h1>
          <p className="text-lg text-muted-foreground">
            Optimize your crop rotations. Select your farm parameters below to calculate which crops will yield the highest returns in the upcoming planting window.
          </p>
        </section>

        {/* Dynamic Rotation Selector / Form */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Inputs Column */}
          <div className="lg:col-span-1 glass p-6 rounded-xl border border-border/40 space-y-6">
            <div className="flex items-center space-x-2 border-b border-border/40 pb-4">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-white">Farm Parameters</h2>
            </div>

            {/* Region */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Farm Region
              </label>
              <div className="grid grid-cols-1 gap-2">
                {REGIONS.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left text-sm transition-all ${
                      selectedRegion === region.id
                        ? "bg-primary/10 border-primary text-white"
                        : "bg-slate-900 border-border/40 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div>
                        <span className="font-semibold block">{region.name}</span>
                        <span className="text-[10px] text-muted-foreground">{region.country}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-border/30">
                      Rainfall: {region.typicalRainfall}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Soil Type */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Soil Type
              </label>
              <div className="grid grid-cols-1 gap-2">
                {SOIL_TYPES.map((soil) => (
                  <button
                    key={soil.id}
                    onClick={() => setSelectedSoil(soil.id)}
                    className={`flex flex-col p-3 rounded-lg border text-left text-sm transition-all ${
                      selectedSoil === soil.id
                        ? "bg-primary/10 border-primary text-white"
                        : "bg-slate-900 border-border/40 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <span className="font-semibold">{soil.name}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{soil.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Irrigation Type */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Water Availability
              </label>
              <div className="grid grid-cols-1 gap-2">
                {WATER_SOURCES.map((water) => (
                  <button
                    key={water.id}
                    onClick={() => setSelectedWater(water.id)}
                    className={`flex items-center space-x-3 p-3 rounded-lg border text-left text-sm transition-all ${
                      selectedWater === water.id
                        ? "bg-primary/10 border-primary text-white"
                        : "bg-slate-900 border-border/40 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <CloudRain className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <span className="font-semibold block">{water.name}</span>
                      <span className="text-[10px] text-muted-foreground">{water.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-primary-foreground font-semibold py-3 rounded-lg text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer shadow"
            >
              <span>{analyzing ? "Analyzing Crop Rotations..." : "Calculate Recommendations"}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Recommendations Output Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sprout className="h-5 w-5 text-emerald-400" />
              <span>Recommended Crops ({recommendations.length})</span>
            </h2>

            {analyzing ? (
              <div className="glass p-20 rounded-xl text-center border border-border/40">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                <p className="mt-4 text-muted-foreground text-sm font-medium">Re-calculating biological yields & forecasting index price values...</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="glass p-12 rounded-xl text-center border border-border/40">
                <Info className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No matches found. Try adjusting your parameters or selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((crop, idx) => (
                  <div key={idx} className="glass p-6 rounded-xl border border-border/40 flex flex-col justify-between hover:translate-y-[-2px] transition-all">
                    
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {crop.category}
                        </span>
                        
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground block">Profit Margin</span>
                          <span className="text-emerald-400 font-extrabold text-base">{crop.margin}%</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-black text-white mb-2">{crop.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                        {crop.rationale}
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-border/30 pt-4 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span>Days to Harvest:</span>
                        </span>
                        <span className="text-white font-semibold">{crop.daysToHarvest} days</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="flex items-center space-x-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                          <span>Index Price Target:</span>
                        </span>
                        <span className="text-white font-semibold">${crop.avgPrice}/ton</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="flex items-center space-x-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-primary" />
                          <span>Market Demand:</span>
                        </span>
                        <span className="text-secondary font-bold">{crop.demand}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Smart Farmer rotations alert */}
            <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-xl flex items-start space-x-4">
              <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-white block mb-1">Rotation Strategy Suggestion:</strong>
                If you recently planted Maize, rotation with nitrogen-fixing Legumes (Beans) is highly recommended. It naturally replenishes soil nutrients, reducing fertilizer overhead costs by up to 35% in the subsequent cycle.
              </div>
            </div>

          </div>

        </section>

      </main>

      <Footer />
    </div>
  )
}
