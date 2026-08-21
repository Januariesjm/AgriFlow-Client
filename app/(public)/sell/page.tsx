"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { supabase } from "@/lib/supabase"
import { clientApiGet } from "@/lib/api-client"
import { Profile } from "@/lib/types"
import { Session } from "@supabase/supabase-js"
import { 
  TrendingUp, 
  Calculator, 
  ArrowRight, 
  ShieldCheck, 
  Coins,
  Truck,
  Sparkles,
  CheckCircle,
} from "lucide-react"

const CROP_PRICES = [
  { id: "maize", name: "Maize", pricePerTon: 220, unit: "ton" },
  { id: "beans", name: "Beans", pricePerTon: 380, unit: "ton" },
  { id: "rice", name: "Rice", pricePerTon: 490, unit: "ton" },
  { id: "tomatoes", name: "Tomatoes", pricePerTon: 280, unit: "ton" },
  { id: "onions", name: "Onions", pricePerTon: 320, unit: "ton" },
  { id: "coffee", name: "Coffee Beans", pricePerTon: 1250, unit: "ton" },
]

const BUYER_DEMANDS = [
  { id: 1, crop: "Maize", qty: 45, unit: "tons", location: "Nairobi, Kenya", targetPrice: 225, urgency: "High" },
  { id: 2, crop: "Beans", qty: 20, unit: "tons", location: "Kampala, Uganda", targetPrice: 390, urgency: "Medium" },
  { id: 3, crop: "Rice", qty: 15, unit: "tons", location: "Dar es Salaam, Tanzania", targetPrice: 500, urgency: "Medium" },
  { id: 4, crop: "Tomatoes", qty: 8, unit: "tons", location: "Kigali, Rwanda", targetPrice: 295, urgency: "High" },
  { id: 5, crop: "Coffee Beans", qty: 30, unit: "tons", location: "Mombasa, Kenya", targetPrice: 1300, urgency: "Low" },
]

export default function SellPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  
  const [selectedCrop, setSelectedCrop] = useState(CROP_PRICES[0])
  const [quantity, setQuantity] = useState<number>(10)
  const [transportDistance, setTransportDistance] = useState<number>(50)
  
  const [fulfilledId, setFulfilledId] = useState<number | null>(null)

  const fetchProfile = useCallback(async () => {
    try {
      const data = await clientApiGet<{ profile: Profile }>("profile")
      if (data?.profile) {
        setProfile(data.profile)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchProfile()
      }
    })
  }, [fetchProfile])

  const grossEarnings = selectedCrop.pricePerTon * quantity
  const platformFee = grossEarnings * 0.02
  const transportCostEstimate = quantity * transportDistance * 0.15
  const netEarnings = Math.max(0, grossEarnings - platformFee - transportCostEstimate)

  const handleFulfill = (id: number) => {
    setFulfilledId(id)
    setTimeout(() => setFulfilledId(null), 4000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-foreground">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto pt-8">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 tracking-wide">
              Direct Farmer to Buyer Escrow Trading
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
            Sell Your Harvest for the <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Highest Market Price
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            List your crops before or after harvest, receive competitive bids, and access guaranteed payments with automated regional logistics.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {session ? (
              profile?.role === "farmer" ? (
                <Link
                  href="/dashboard/farmer/products"
                  className="bg-primary hover:bg-primary/95 text-primary-foreground px-6 py-3 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 shadow"
                >
                  <span>Go to Farmer Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-400">
                  You are logged in as a <strong>{profile?.role || "user"}</strong>. Register a farmer account to start listing.
                </div>
              )
            ) : (
              <>
                <Link
                  href="/register?role=farmer"
                  className="bg-primary hover:bg-primary/95 text-primary-foreground px-6 py-3 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 shadow"
                >
                  <span>Register as a Farmer</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="bg-slate-900 border border-border hover:bg-slate-800 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Dynamic Calculator & Benefits grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Earnings Estimator */}
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
                  value={selectedCrop.id}
                  onChange={(e) => {
                    const c = CROP_PRICES.find((item) => item.id === e.target.value)
                    if (c) setSelectedCrop(c)
                  }}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  {CROP_PRICES.map((crop) => (
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
                  type="range"
                  min="1"
                  max="150"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
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
                  type="range"
                  min="5"
                  max="500"
                  value={transportDistance}
                  onChange={(e) => setTransportDistance(Number(e.target.value))}
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
                <span className="text-2xl font-black text-secondary">${netEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              Estimates based on regional index prices. Exact pricing depends on harvest quality and negotiation.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Why Sell on AgriFlow?</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass p-6 rounded-xl border border-border/20 flex flex-col space-y-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Coins className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-bold text-white text-sm">Guaranteed Escrow Payouts</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Buyers deposit funds in escrow before dispatch. You are fully protected from payment delays or defaults.
                </p>
              </div>

              <div className="glass p-6 rounded-xl border border-border/20 flex flex-col space-y-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-bold text-white text-sm">Direct Market Access</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By bypassing brokers and middlemen, AgriFlow increases farmer take-home margins by up to 25%.
                </p>
              </div>

              <div className="glass p-6 rounded-xl border border-border/20 flex flex-col space-y-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-bold text-white text-sm">Integrated Logistics</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No need to search for trucks. AgriFlow automatically bids and books regional transporters based on distance and weight.
                </p>
              </div>

              <div className="glass p-6 rounded-xl border border-border/20 flex flex-col space-y-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-bold text-white text-sm">Pre-Harvest Listing</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  List crop details while they grow to secure agreements and crop advances weeks before harvest.
                </p>
              </div>
            </div>
          </div>

        </section>

        {/* Live Buyer Demands Feed */}
        <section className="glass rounded-xl border border-border/40 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                Live Buyer Demands
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Fulfill these immediate regional demands to secure high-value transactions.
              </p>
            </div>
            
            <div className="text-xs text-muted-foreground bg-slate-900 border border-border px-3 py-1.5 rounded-lg self-start">
              Updated just now
            </div>
          </div>

          <div className="divide-y divide-border/20">
            {BUYER_DEMANDS.map((demand) => (
              <div key={demand.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-900/20 px-2 rounded-lg transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{demand.crop}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      demand.urgency === "High" 
                        ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                        : demand.urgency === "Medium"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      {demand.urgency} Urgency
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Required Quantity: <strong className="text-foreground">{demand.qty} {demand.unit}</strong> | Region: <strong className="text-foreground">{demand.location}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-6 self-end md:self-auto w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Target Price</span>
                    <span className="text-secondary font-black text-lg">${demand.targetPrice} / ton</span>
                  </div>
                  
                  {fulfilledId === demand.id ? (
                    <button className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5">
                      <CheckCircle className="h-4 w-4" />
                      <span>Request Sent</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleFulfill(demand.id)}
                      className="bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      Offer Harvest
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
