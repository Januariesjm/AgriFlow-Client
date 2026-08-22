"use client"

import { Calculator } from "lucide-react"

export interface CropPriceItem {
  id: string
  name: string
  pricePerTon: number
  unit: string
}

export interface SellCalculatorProps {
  cropPrices: CropPriceItem[]
  selectedCrop: CropPriceItem
  onSelectCrop: (crop: CropPriceItem) => void
  quantity: number
  onQuantityChange: (qty: number) => void
  transportDistance: number
  onDistanceChange: (dist: number) => void
  grossEarnings: number
  platformFee: number
  transportCostEstimate: number
  netEarnings: number
}

export default function SellCalculator({
  cropPrices,
  selectedCrop,
  onSelectCrop,
  quantity,
  onQuantityChange,
  transportDistance,
  onDistanceChange,
  grossEarnings,
  platformFee,
  transportCostEstimate,
  netEarnings,
}: SellCalculatorProps) {
  return (
    <div className="glass p-8 rounded-xl border border-border/40 space-y-6">
      <div className="flex items-center space-x-2 border-b border-border/40 pb-4">
        <Calculator className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold text-white">Interactive Earnings Estimator</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">
            Select Crop
          </label>
          <select
            aria-label="Select Crop"
            value={selectedCrop.id}
            onChange={(e) => {
              const c = cropPrices.find((item) => item.id === e.target.value)
              if (c) onSelectCrop(c)
            }}
            className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
          >
            {cropPrices.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name} (${crop.pricePerTon}/ton regional average)
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold uppercase text-muted-foreground mb-2">
            <span>Harvest Quantity</span>
            <span className="text-primary font-bold">{quantity} Tons</span>
          </div>
          <input
            aria-label="Harvest Quantity"
            type="range"
            min="1"
            max="150"
            value={quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>1 Ton</span>
            <span>75 Tons</span>
            <span>150 Tons</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold uppercase text-muted-foreground mb-2">
            <span>Transport Distance</span>
            <span className="text-primary font-bold">{transportDistance} km</span>
          </div>
          <input
            aria-label="Transport Distance"
            type="range"
            min="5"
            max="500"
            value={transportDistance}
            onChange={(e) => onDistanceChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>5 km</span>
            <span>250 km</span>
            <span>500 km</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 rounded-xl p-6 border border-border/40 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Gross Revenue:</span>
          <span className="text-white font-bold">${grossEarnings.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">AgriFlow Platform Fee (2%):</span>
          <span className="text-red-400">-${platformFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Est. Transport Cost:</span>
          <span className="text-red-400">-${transportCostEstimate.toFixed(2)}</span>
        </div>
        <div className="border-t border-border/40 pt-4 flex justify-between items-center">
          <span className="font-semibold text-white">Estimated Net Payout:</span>
          <span className="text-2xl font-black text-secondary">
            ${netEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Estimates based on regional index prices. Exact pricing depends on harvest quality and negotiation.
      </p>
    </div>
  )
}
