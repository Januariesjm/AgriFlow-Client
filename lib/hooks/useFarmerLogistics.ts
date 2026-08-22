"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "@/lib/hooks/useSession"
import { clientApiGet, clientApiPost } from "@/lib/api-client"
import { logger } from "@/lib/logger"
import { Order, Farm, Vehicle, TransportRequest } from "@/lib/types"

/**
 * Loads every data set the farmer logistics dashboard needs (orders, farms,
 * vehicles, transport requests) and owns the transport booking workflow, so
 * the page component only renders state.
 */
export function useFarmerLogistics() {
  const { session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [ordersData, farmsData, vehiclesData, requestsData] = await Promise.all([
        clientApiGet<{ orders: Order[] }>("orders?role=farmer"),
        clientApiGet<{ farms: Farm[] }>("farms"),
        clientApiGet<{ vehicles: Vehicle[] }>("transport/vehicles"),
        clientApiGet<{ requests: TransportRequest[] }>("transport/requests"),
      ])

      if (ordersData?.orders) {
        setOrders(ordersData.orders)
      }
      if (farmsData?.farms) {
        setFarms(farmsData.farms)
      }
      if (vehiclesData?.vehicles) {
        setVehicles(vehiclesData.vehicles)
      }
      if (requestsData?.requests) {
        setTransportRequests(requestsData.requests)
        if (requestsData.requests.length > 0) {
          setSelectedRequest(requestsData.requests[0])
        }
      }
    } catch (err) {
      logger.error("useFarmerLogistics", "Failed to load logistics dashboard data", err)
      setError("Failed to fetch logistics data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      reload()
    }
  }, [session, reload])

  const bookableOrders = orders.filter((o) => {
    const isConfirmed = o.status === "confirmed"
    const alreadyRequested = transportRequests.some((r) => r.order_id === o.id)
    return isConfirmed && !alreadyRequested
  })

  /** Publishes a transport request for the given order. Returns true on success. */
  const bookTransport = async (orderId: string): Promise<boolean> => {
    setError("")
    setSuccess("")
    setSubmitting(true)

    try {
      const order = orders.find((o) => o.id === orderId)
      if (!order) throw new Error("Order not found")

      const farm = farms.find((f) => f.id === order.product?.farm_id) || farms[0]
      const pickupLat = farm ? farm.gps_lat : -1.2921
      const pickupLng = farm ? farm.gps_lng : 36.8219

      const deliveryLat = order.delivery_lat || -1.3005
      const deliveryLng = order.delivery_lng || 36.8822

      await clientApiPost("transport/request", {
        order_id: orderId,
        pickup_lat: Number(pickupLat),
        pickup_lng: Number(pickupLng),
        delivery_lat: Number(deliveryLat),
        delivery_lng: Number(deliveryLng),
      })

      setSuccess("Transport dispatch request published to nearby transporters!")
      reload()
      setTimeout(() => setSuccess(""), 4000)
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create transport booking request"
      logger.error("useFarmerLogistics", "Transport booking failed", err)
      setError(msg)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  return {
    orders,
    farms,
    vehicles,
    transportRequests,
    bookableOrders,
    loading,
    submitting,
    error,
    success,
    selectedRequest,
    setSelectedRequest,
    reload,
    bookTransport,
  }
}
