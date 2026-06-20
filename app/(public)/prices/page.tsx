"use client"

import { useState, useEffect } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { TrendingUp, Truck, DollarSign, Table, HelpCircle } from "lucide-react"

export default function PriceIntelligence() {
  const [crop, setCrop] = useState("Maize")
  const [lat, setLat] = useState("-1.2921") // Nairobi default
  const [lng, setLng] = useState("36.8219")
  const [comparisons, setComparisons] = useState<any[]>([])
  const [cheapest, setCheapest] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  const crops = ["Maize", "Beans", "Rice", "Tomatoes", "Onions", "Potatoes"]

  useEffect(() => {
    handleCompare()
  }, [crop])

  const handleCompare = async () => {
    setLoading(true)
    try {
      const compareParams = new URLSearchParams({
        product: crop,
        buyer_lat: lat,
        buyer_lng: lng,
      })

      const [compareRes, historyRes] = await Promise.all([
        fetch(`http://localhost:4000/api/prices/compare?${compareParams.toString()}`),
        fetch(`http://localhost:4000/api/prices/history?product=${crop}`),
      ])

      if (compareRes.ok) {
        const compareData = await compareRes.json()
        setComparisons(compareData.comparisons)
        setCheapest(compareData.cheapest_delivered)
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setHistory(historyData.history)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-foreground flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            East Africa Price Intelligence
          </h1>
          <p className="text-muted-foreground">
            Merges regional marketplace rates with transport estimations to discover the cheapest landing cost.
          </p>
        </div>

        {/* Inputs Panel */}
        <div className="glass p-6 rounded-xl mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs text-muted-foreground uppercase font-bold mb-2">Target Commodity</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
            >
              {crops.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground uppercase font-bold mb-2">Buyer Latitude</label>
            <input
              type="number"
              step="0.0001"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground uppercase font-bold mb-2">Buyer Longitude</label>
            <input
              type="number"
              step="0.0001"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <button
              onClick={handleCompare}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-2 rounded-lg text-sm transition-all cursor-pointer h-10"
            >
              Compare Landed Costs
            </button>
          </div>
        </div>

        {/* Cheapest Delivered Highlight */}
        {cheapest && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold">Cheapest Landed Cost Option</span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Ship from <span className="text-primary">{cheapest.country}</span>
                </h3>
              </div>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-xs text-muted-foreground block">Estimated Landed Cost</span>
              <span className="text-2xl font-black text-secondary">${cheapest.delivered_cost}/ton</span>
              {cheapest.savings_vs_most_expensive > 0 && (
                <span className="text-xs text-green-400 block mt-1">
                  Saves up to ${cheapest.savings_vs_most_expensive}/ton
                </span>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Comparisons Table */}
          <div className="lg:col-span-2 glass rounded-xl p-6 overflow-hidden">
            <div className="flex items-center space-x-2 mb-6">
              <Table className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-white">Landed Price Matrix</h3>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
                <p className="text-sm text-muted-foreground mt-2">Computing price comparisons...</p>
              </div>
            ) : comparisons.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No active listings found for comparison.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase">
                      <th className="py-3 px-4">Country</th>
                      <th className="py-3 px-4">Market Price</th>
                      <th className="py-3 px-4">Transport Est.</th>
                      <th className="py-3 px-4">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 text-sm">
                    {comparisons.map((item) => (
                      <tr key={item.country} className="hover:bg-slate-900/40">
                        <td className="py-4 px-4 font-semibold text-white">{item.country}</td>
                        <td className="py-4 px-4 text-muted-foreground">${item.avg_price}/ton</td>
                        <td className="py-4 px-4 text-muted-foreground">${item.transport_estimate}/ton</td>
                        <td className="py-4 px-4 text-secondary font-black">${item.delivered_cost}/ton</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Historical Trend Information panel */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-white">Pricing Insights</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Landed costs are computed based on average marketplace values from selected countries added to distance-based shipping rates.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-slate-900/60 border border-border/40">
                <Truck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Carrier Cost Estimates</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculations reflect border crossing licenses, highway tariffs, and general fuel rates.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg bg-slate-900/60 border border-border/40">
                <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Dynamic Pricing Arbitrage</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enables food processors and exporters to capitalize on pricing differentials between regional markets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
