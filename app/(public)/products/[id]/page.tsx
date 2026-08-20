"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { supabase } from "@/lib/supabase"
import { api } from "@/lib/api"
import { Product } from "@/lib/types"
import { TransportCostEstimate, TransportCostEstimateSchema } from "@/lib/schemas"
import { calculateCropTotal, calculateLandedCost, buildTransportCostQueryParams } from "@/lib/checkout"
import { Session } from "@supabase/supabase-js"
import { Sprout, MapPin, Scale, Calendar, ArrowLeft, Truck, DollarSign, ShieldAlert } from "lucide-react"

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState("")
  const [orderSuccess, setOrderSuccess] = useState(false)

  // Transport calculation state
  const [buyerLat, setBuyerLat] = useState("-1.2921") // Nairobi default
  const [buyerLng, setBuyerLng] = useState("36.8219")
  const [transportCost, setTransportCost] = useState<number | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [calcLoading, setCalcLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session)
    })
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const data = await api.get<{ product?: Product }>(`products/${id}`)
      if (data?.product) {
        setProduct(data.product)
      }
    } catch (err) {
      console.error("Failed to fetch product:", err)
    } finally {
      setLoading(false)
    }
  }

  const calculateTransport = async () => {
    if (!product) return
    setCalcLoading(true)
    try {
      const queryParams = buildTransportCostQueryParams(
        product.gps_lat,
        product.gps_lng,
        buyerLat,
        buyerLng,
        orderQuantity
      )

      const data = await api.get<TransportCostEstimate>(`transport/cost?${queryParams.toString()}`)
      const parsed = TransportCostEstimateSchema.safeParse(data)
      if (parsed.success) {
        setTransportCost(parsed.data.estimated_cost)
        setDistance(parsed.data.distance_km)
      } else if (data && typeof data.estimated_cost === "number") {
        setTransportCost(data.estimated_cost)
        setDistance(data.distance_km)
      }
    } catch (err) {
      console.error("Failed to calculate transport cost:", err)
    } finally {
      setCalcLoading(false)
    }
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      router.push("/login")
      return
    }

    if (!product) return

    setOrderLoading(true)
    setOrderError("")
    try {
      await api.post(
        "orders",
        {
          product_id: product.id,
          quantity: orderQuantity,
          delivery_lat: Number(buyerLat),
          delivery_lng: Number(buyerLng),
          delivery_address: `Coordinates: ${buyerLat}, ${buyerLng}`,
        },
        session.access_token
      )

      setOrderSuccess(true)
      fetchProduct()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Order placement failed"
      setOrderError(errorMessage)
    } finally {
      setOrderLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold text-white">Offer Not Found</h2>
          <p className="text-muted-foreground mt-2">This product listing may have been sold or removed.</p>
          <Link href="/products" className="text-primary hover:underline mt-4">Back to Marketplace</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const cropTotal = calculateCropTotal(product.price, orderQuantity)
  const totalLanded = calculateLandedCost(product.price, orderQuantity, transportCost)

  return (
    <div className="min-h-screen bg-slate-950 text-foreground flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/products" className="inline-flex items-center space-x-2 text-sm text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Info Left column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-8 rounded-xl">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <span className="bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-2.5 py-1 rounded-full uppercase">
                    {product.category}
                  </span>
                  <h1 className="text-3xl font-extrabold text-white mt-2">{product.name}</h1>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Price per {product.unit}</span>
                  <span className="text-2xl font-black text-secondary">${product.price}</span>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.description || "No description provided."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-border/40 pt-6">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <span className="text-xs text-muted-foreground block font-semibold">Location</span>
                    <span className="text-sm font-semibold text-white">{product.region}, {product.country}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Scale className="h-5 w-5 text-primary" />
                  <div>
                    <span className="text-xs text-muted-foreground block font-semibold">Available Stock</span>
                    <span className="text-sm font-semibold text-white">{product.quantity} {product.unit}s</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <span className="text-xs text-muted-foreground block font-semibold">Harvest Date</span>
                    <span className="text-sm font-semibold text-white">{product.harvest_date || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transport Cost Engine Card */}
            <div className="glass p-8 rounded-xl">
              <div className="flex items-center space-x-2 mb-6">
                <Truck className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-white">Delivered Cost Engine</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Enter your delivery coordinates below to calculate distance, route pricing, and the total landed cost.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-muted-foreground uppercase font-bold mb-1.5">Destination Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={buyerLat}
                    onChange={(e) => setBuyerLat(e.target.value)}
                    className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground uppercase font-bold mb-1.5">Destination Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={buyerLng}
                    onChange={(e) => setBuyerLng(e.target.value)}
                    className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={calculateTransport}
                disabled={calcLoading}
                className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
              >
                {calcLoading ? "Calculating..." : "Estimate Delivery Costs"}
              </button>

              {distance !== null && transportCost !== null && (
                <div className="mt-8 border-t border-border/40 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-slate-900/60 p-4 rounded-lg border border-border/40">
                    <span className="text-xs text-muted-foreground block font-bold mb-1">Route Distance</span>
                    <span className="text-lg font-black text-white">{distance} KM</span>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-lg border border-border/40">
                    <span className="text-xs text-muted-foreground block font-bold mb-1">Transport Cost</span>
                    <span className="text-lg font-black text-primary">${transportCost}</span>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-lg border border-border/40">
                    <span className="text-xs text-muted-foreground block font-bold mb-1">Landed Cost</span>
                    <span className="text-lg font-black text-secondary">
                      ${totalLanded}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Place Order Panel Right column */}
          <div className="space-y-6">
            <div className="glass p-8 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-6">Place Direct Order</h3>

              {orderSuccess ? (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm p-4 rounded-lg text-center">
                  <Sprout className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="font-semibold">Order Placed Successfully!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    The farmer has been notified to verify and arrange dispatch.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePlaceOrder} className="space-y-5">
                  {orderError && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs p-3 rounded-lg">
                      {orderError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-muted-foreground uppercase font-bold mb-1.5">Order Quantity</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max={product.quantity}
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                      />
                      <span className="text-sm font-semibold text-muted-foreground uppercase">{product.unit}s</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-lg border border-border/40 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Crop Cost:</span>
                      <span>${cropTotal}</span>
                    </div>
                    {transportCost !== null && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Est. Shipping:</span>
                        <span>${transportCost}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-white border-t border-border/40 pt-2">
                      <span>Total Landed:</span>
                      <span>
                        ${totalLanded}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={orderLoading || product.quantity <= 0}
                    className="w-full h-10 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-lg shadow transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>{orderLoading ? "Processing..." : session ? "Confirm Purchase" : "Sign In to Buy"}</span>
                  </button>
                </form>
              )}
            </div>

            <div className="glass p-6 rounded-xl">
              <h4 className="text-sm font-bold text-white mb-2">Farmer Information</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Verify credentials and history before placing bulk orders.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Farmer Name:</span>
                  <span className="text-white font-semibold">{product.profiles?.full_name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Origin:</span>
                  <span className="text-white font-semibold">{product.profiles?.region}, {product.profiles?.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-primary font-semibold">Verified Member</span>
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
