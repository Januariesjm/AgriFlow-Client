"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { FileText, CheckCircle2, XCircle, ChevronRight, User, AlertCircle, ShoppingBag } from "lucide-react"

interface Booking {
  id: string
  tenantName: string
  tenantPhone: string
  cropType: string
  quantity: number // tons
  facilityId: string
  facilityName: string
  duration: number // days
  totalCost: number
  status: "pending" | "confirmed" | "checked_in" | "completed" | "cancelled"
  createdAt: string
  notes?: string
}

interface Facility {
  id: string
  name: string
  capacity: number
  occupied: number
}

import { useSession } from "@/lib/hooks/useSession"

export default function WarehouseBookings() {
  const { session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [filter, setFilter] = useState<string>("all")

  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (session?.user) {
      loadData(session.user.id)
    }
  }, [session])

  const loadData = (userId: string) => {
    // 1. Load Facilities
    const storedFac = localStorage.getItem(`af_warehouse_facilities_${userId}`)
    let facList: Facility[] = []
    if (storedFac) {
      facList = JSON.parse(storedFac)
      setFacilities(facList)
    }

    // 2. Load Bookings
    const storedBookings = localStorage.getItem(`af_warehouse_bookings_${userId}`)
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings))
    } else {
      const defaultBookings: Booking[] = [
        { id: "b1", tenantName: "Timothy Kiprop", tenantPhone: "+254 712 345678", cropType: "Potatoes", quantity: 80, facilityId: "f1", facilityName: "Rift Valley Cold Hub", duration: 30, totalCost: 1920.00, status: "pending", createdAt: new Date(Date.now() - 3600000).toISOString(), notes: "Requires low temp of 4°C" },
        { id: "b2", tenantName: "Kiambu Farmers Coop", tenantPhone: "+254 722 999888", cropType: "Maize Grains", quantity: 450, facilityId: "f2", facilityName: "Nakuru Dry Silos", duration: 60, totalCost: 10800.00, status: "confirmed", createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: "b3", tenantName: "Alice Awuor", tenantPhone: "+254 755 111222", cropType: "Wheat Bags", quantity: 120, facilityId: "f3", facilityName: "Molo Ambient Store", duration: 15, totalCost: 540.00, status: "completed", createdAt: new Date(Date.now() - 86400000).toISOString() }
      ]
      setBookings(defaultBookings)
      localStorage.setItem(`af_warehouse_bookings_${userId}`, JSON.stringify(defaultBookings))
    }
  }

  const saveBookings = (list: Booking[]) => {
    setBookings(list)
    if (session?.user) {
      localStorage.setItem(`af_warehouse_bookings_${session.user.id}`, JSON.stringify(list))
    }
  }

  const handleUpdateStatus = (id: string, newStatus: Booking["status"]) => {
    setError("")
    setSuccess("")

    const targetBooking = bookings.find((b) => b.id === id)
    if (!targetBooking) return

    // Validate capacity when checking in
    if (newStatus === "checked_in") {
      const fac = facilities.find((f) => f.id === targetBooking.facilityId)
      if (fac) {
        const potentialOccupied = fac.occupied + targetBooking.quantity
        if (potentialOccupied > fac.capacity) {
          setError(`Cannot check-in. This exceeds the facility capacity by ${potentialOccupied - fac.capacity} tons.`)
          return
        }
        // Deduct from facility capacity
        updateFacilityCapacity(targetBooking.facilityId, targetBooking.quantity)
      }
    }

    // Free capacity when checked out / completed
    if (newStatus === "completed" && targetBooking.status === "checked_in") {
      updateFacilityCapacity(targetBooking.facilityId, -targetBooking.quantity)
      addEarningsToWallet(targetBooking.totalCost)
    }

    const updated = bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    saveBookings(updated)
    setSuccess(`Storage lease status updated to ${newStatus.replace("_", " ")}!`)
    setTimeout(() => setSuccess(""), 4000)
  }

  const updateFacilityCapacity = (facilityId: string, quantityChange: number) => {
    if (!session?.user) return
    const updatedFacs = facilities.map((f) => {
      if (f.id === facilityId) {
        return { ...f, occupied: Math.max(0, f.occupied + quantityChange) }
      }
      return f
    })
    setFacilities(updatedFacs)
    localStorage.setItem(`af_warehouse_facilities_${session.user.id}`, JSON.stringify(updatedFacs))
  }

  const addEarningsToWallet = (amount: number) => {
    if (!session?.user) return
    const walletKey = `af_warehouse_wallet_${session.user.id}`
    const stored = localStorage.getItem(walletKey)
    let balance = 420.0
    let lifetime = 2140.0
    let ledgers = []

    if (stored) {
      const parsed = JSON.parse(stored)
      balance = parsed.balance ?? 420.0
      lifetime = parsed.lifetime ?? 2140.0
      ledgers = parsed.ledgers ?? []
    }

    const newBalance = balance + amount
    const newLifetime = lifetime + amount
    const newLedger = {
      id: `led-${Date.now()}`,
      type: "credit",
      amount,
      desc: `Cleared storage lease rent payout`,
      date: new Date().toISOString()
    }

    localStorage.setItem(
      walletKey,
      JSON.stringify({
        balance: newBalance,
        lifetime: newLifetime,
        ledgers: [newLedger, ...ledgers]
      })
    )
  }

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true
    return b.status === filter
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <span>Storage Bookings & Leases</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Review space inquiries, check-in incoming agricultural cargos, and track checkout clearing.
        </p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border/20 pb-4">
        {[
          { label: "All Requests", value: "all" },
          { label: "Pending Requests", value: "pending" },
          { label: "Approved Leases", value: "confirmed" },
          { label: "Checked In Cargo", value: "checked_in" },
          { label: "Finalized / Completed", value: "completed" },
          { label: "Cancelled", value: "cancelled" }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === tab.value
                ? "bg-primary text-primary-foreground shadow"
                : "bg-slate-900 border border-border text-muted-foreground hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="glass p-12 text-center text-sm text-muted-foreground">
          No bookings found matching this status filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div key={b.id} className="glass p-6 rounded-xl border border-border/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-3.5 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-sm font-mono text-white font-bold">BKG-{b.id.toUpperCase()}</span>
                  <span className="text-xs text-muted-foreground">· {new Date(b.createdAt).toLocaleString()}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    b.status === "completed"
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : b.status === "pending"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      : b.status === "checked_in"
                      ? "bg-primary/10 border-primary/20 text-primary animate-pulse"
                      : b.status === "cancelled"
                      ? "bg-red-500/10 border-red-500/20 text-red-500"
                      : "bg-slate-800 border-border text-muted-foreground"
                  }`}>
                    {b.status.replace("_", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Depositor / Tenant</span>
                    <span className="text-white font-semibold block">{b.tenantName}</span>
                    <span className="text-[11px] text-muted-foreground">{b.tenantPhone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Crop Cargo & Space</span>
                    <span className="text-white font-semibold block">{b.cropType}</span>
                    <span className="text-[11px] text-muted-foreground">{b.quantity} tons reserved at <strong className="text-white">{b.facilityName}</strong></span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Rental Booking Cost</span>
                    <span className="text-secondary font-extrabold text-sm">${b.totalCost.toFixed(2)}</span>
                    <span className="text-[11px] text-muted-foreground block">For {b.duration} days lease</span>
                  </div>
                </div>

                {b.notes && (
                  <div className="text-xs bg-slate-950 p-2.5 rounded-lg border border-border/20 text-muted-foreground">
                    Notes: <span className="italic">"{b.notes}"</span>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap md:flex-col gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-border/20">
                {b.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(b.id, "confirmed")}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Approve Request</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(b.id, "cancelled")}
                      className="bg-slate-900 border border-border hover:bg-slate-800 text-red-400 text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Reject</span>
                    </button>
                  </>
                )}

                {b.status === "confirmed" && (
                  <button
                    onClick={() => handleUpdateStatus(b.id, "checked_in")}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Check-In Cargo</span>
                  </button>
                )}

                {b.status === "checked_in" && (
                  <button
                    onClick={() => handleUpdateStatus(b.id, "completed")}
                    className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Check-Out & Settle</span>
                  </button>
                )}

                {(b.status === "completed" || b.status === "cancelled") && (
                  <span className="text-[10px] text-muted-foreground uppercase font-bold italic py-2 text-center">
                    lease finalized
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
