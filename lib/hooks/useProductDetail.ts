import { useState, useCallback } from "react"
import { api } from "@/lib/api"
import { logger } from "@/lib/logger"
import { Product } from "@/lib/types"
import { TransportCostEstimate, TransportCostEstimateSchema } from "@/lib/schemas"
import { buildTransportCostQueryParams } from "@/lib/checkout"
import { Session } from "@supabase/supabase-js"

export function useProductDetail(productId: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  // Order state
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState("")
  const [orderSuccess, setOrderSuccess] = useState(false)

  // Transport state
  const [buyerLat, setBuyerLat] = useState("-1.2921")
  const [buyerLng, setBuyerLng] = useState("36.8219")
  const [transportCost, setTransportCost] = useState<number | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [calcLoading, setCalcLoading] = useState(false)

  const fetchProduct = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    try {
      const data = await api.get<{ product?: Product }>(`products/${productId}`)
      if (data?.product) {
        setProduct(data.product)
      }
    } catch (err: unknown) {
      logger.error("useProductDetail", `Failed to fetch product ${productId}`, err)
    } finally {
      setLoading(false)
    }
  }, [productId])

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
    } catch (err: unknown) {
      logger.warn("useProductDetail", "Failed to calculate transport cost", err)
    } finally {
      setCalcLoading(false)
    }
  }

  const handlePlaceOrder = async (session: Session | null, e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!session) {
      return { redirectLogin: true }
    }

    if (!product) return { redirectLogin: false }

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
      await fetchProduct()
      return { success: true }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Order placement failed"
      setOrderError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setOrderLoading(false)
    }
  }

  return {
    product,
    loading,
    orderQuantity,
    setOrderQuantity,
    orderLoading,
    orderError,
    orderSuccess,
    buyerLat,
    setBuyerLat,
    buyerLng,
    setBuyerLng,
    transportCost,
    distance,
    calcLoading,
    fetchProduct,
    calculateTransport,
    handlePlaceOrder,
  }
}
