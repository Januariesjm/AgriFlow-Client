"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Table, Truck } from "lucide-react"

export default function BuyerPrices() {
  const [crop, setCrop] = useState("Maize")
  const [lat, setLat] = useState("-1.2921")
  const [lng, setLng] = useState("36.8219")
  const [comparisons, setComparisons] = useState<any[]>([])
  const [cheapest, setCheapest] = useState<any>(null)
  const [loading, setLoading] = useState(false)

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

      const res = await fetch(`http://localhost:4000/api/prices/compare?${compareParams.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setComparisons(compareData => data.comparisons || [])
        setCheapest(data.cheapest_delivered)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Delivered Cost Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Input your location coordinates to determine cheapest supply points including shipping fees.
        </p>
      </div>

      <div className="glass p-6 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs text-muted-foreground uppercase font-bold mb-2">Crop type</label>
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
          <label className="block text-xs text-muted-foreground uppercase font-bold mb-2">Destination Latitude</label>
          <input
            type="number"
            step="0.0001"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-muted-foreground uppercase font-bold mb-2">Destination Longitude</label>
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
            Run Arbitrage Comparison
          </button>
        </div>
      </div>

      {cheapest && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold">Cheapest Route Option</span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                Ship from <span className="text-primary">{cheapest.country}</span>
              </h3>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Landed Rate</span>
            <span className="text-2xl font-black text-secondary">${cheapest.delivered_cost}/ton</span>
          </div>
        </div>
      )}

      <div className="glass rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Table className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-white">Cross-Border Landed Price Matrix</h3>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
          </div>
        ) : comparisons.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No active listings found for comparison.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase">
                  <th className="py-3 px-4">Origin Country</th>
                  <th className="py-3 px-4">Market average</th>
                  <th className="py-3 px-4">Logistics estimate</th>
                  <th className="py-3 px-4">Landed cost</th>
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
    </div>
  )
}
