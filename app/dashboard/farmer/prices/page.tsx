"use client"
import { logger } from "@/lib/logger"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { PriceHistory } from "@/lib/types"
import { TrendingUp, Award, BarChart3, AlertCircle } from "lucide-react"

export default function FarmerPrices() {
  const [crop, setCrop] = useState("Maize")
  const [latestPrices, setLatestPrices] = useState<PriceHistory[]>([])
  const [loading, setLoading] = useState(true)

  const crops = ["Maize", "Beans", "Rice", "Tomatoes", "Onions", "Potatoes"]

  const fetchLatestPrices = useCallback(async () => {
    try {
      const data = await api.get<{ prices: PriceHistory[] }>("prices/latest")
      if (data?.prices) {
        setLatestPrices(data.prices)
      }
    } catch (err) {
      logger.error("DashboardFarmerPrices", "Operation failed", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLatestPrices()
  }, [fetchLatestPrices])

  const filteredPrices = latestPrices.filter((p) => ((p.crop || p.product_name) ?? "").toLowerCase() === crop.toLowerCase())

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Price Intelligence Trends</h1>
        <p className="text-muted-foreground mt-1">
          Monitor real-time market averages across East Africa to optimize crop pricing strategy.
        </p>
      </div>

      <div className="glass p-6 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-white">Select Crop to Monitor:</span>
        </div>

        <select
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
        >
          {crops.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Country averages matrix */}
        <div className="lg:col-span-2 glass p-6 rounded-xl">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-white">Regional Average Prices ({crop})</h3>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
            </div>
          ) : filteredPrices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              No active market listings recorded for this crop yet.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredPrices.map((p) => (
                <div key={p.country} className="flex justify-between items-center bg-slate-900/60 p-4 rounded-lg border border-border/40">
                  <div>
                    <span className="text-sm font-semibold text-white block">{p.country}</span>
                    <span className="text-xs text-muted-foreground">Based on local listings</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-secondary">${p.avg_price || p.price}</span>
                    <span className="text-xs text-muted-foreground block">per {p.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Suggestions */}
        <div className="glass p-6 rounded-xl space-y-6">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-white">AI Crop Advisor</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Recommended Listing Strategy</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Price {crop} around the average regional rate of ${filteredPrices[0]?.avg_price || filteredPrices[0]?.price || 200}/ton to stay competitive.
                </p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-500">Logistics Recommendation</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Cross-border transport costs can add up to 25% overhead. Target buyers in local zones first.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
