"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { clientApiGet } from "@/lib/api-client"
import { Profile } from "@/lib/types"
import Link from "next/link"
import { Wallet, BarChart3, Plus, ArrowRight, ShieldAlert, FileText, ThermometerSun } from "lucide-react"

interface Facility {
  id: string
  name: string
  type: string
  capacity: number
  occupied: number
  dailyRate: number
}

interface Booking {
  id: string
  tenantName: string
  cropType: string
  quantity: number
  facilityName: string
  duration: number
  totalCost: number
  status: string
  createdAt: string
}

export default function WarehouseOverview() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(420.0)

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

  const loadLocalData = useCallback((userId: string) => {
    setLoading(true)
    try {
      // 1. Facilities
      const storedFac = localStorage.getItem(`af_warehouse_facilities_${userId}`)
      let facList: Facility[] = []
      if (storedFac) {
        facList = JSON.parse(storedFac)
      } else {
        facList = [
          { id: "f1", name: "Rift Valley Cold Hub", type: "Cold Storage", capacity: 500, occupied: 320, dailyRate: 0.8 },
          { id: "f2", name: "Nakuru Dry Silos", type: "Grain Silo", capacity: 1500, occupied: 950, dailyRate: 0.4 },
          { id: "f3", name: "Molo Ambient Store", type: "Ambient Dry", capacity: 800, occupied: 120, dailyRate: 0.3 }
        ]
        localStorage.setItem(`af_warehouse_facilities_${userId}`, JSON.stringify(facList))
      }
      setFacilities(facList)

      // 2. Bookings
      const storedBookings = localStorage.getItem(`af_warehouse_bookings_${userId}`)
      let bookList: Booking[] = []
      if (storedBookings) {
        bookList = JSON.parse(storedBookings)
      } else {
        bookList = [
          { id: "b1", tenantName: "Timothy Kiprop", cropType: "Potatoes", quantity: 80, facilityName: "Rift Valley Cold Hub", duration: 30, totalCost: 1920.00, status: "pending", createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: "b2", tenantName: "Kiambu Farmers Coop", cropType: "Maize Grains", quantity: 450, facilityName: "Nakuru Dry Silos", duration: 60, totalCost: 10800.00, status: "confirmed", createdAt: new Date(Date.now() - 7200000).toISOString() },
          { id: "b3", tenantName: "Alice Awuor", cropType: "Wheat Bags", quantity: 120, facilityName: "Molo Ambient Store", duration: 15, totalCost: 540.00, status: "completed", createdAt: new Date(Date.now() - 86400000).toISOString() }
        ]
        localStorage.setItem(`af_warehouse_bookings_${userId}`, JSON.stringify(bookList))
      }
      setBookings(bookList)

      // 3. Wallet
      const storedWallet = localStorage.getItem(`af_warehouse_wallet_${userId}`)
      if (storedWallet) {
        setBalance(JSON.parse(storedWallet).balance ?? 420.0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile()
        loadLocalData(session.user.id)
      }
    })
  }, [fetchProfile, loadLocalData])

  // Calculations
  const totalCapacity = facilities.reduce((sum, f) => sum + f.capacity, 0)
  const totalOccupied = facilities.reduce((sum, f) => sum + f.occupied, 0)
  const occupancyRate = totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0

  const activeLeases = bookings.filter((b) => b.status === "confirmed").length
  const pendingRequests = bookings.filter((b) => b.status === "pending").length

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome back, <span className="text-primary">{profile?.full_name || "Warehouse Manager"}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Role: <strong className="text-white">Warehouse Owner</strong> · Total Depots Managed: <strong className="text-white">{facilities.length}</strong>
          </p>
        </div>

        <Link
          href="/dashboard/warehouse_owner/facilities"
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm transition-all shadow self-start cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Register Storage Depot</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-xl border border-primary/20 relative overflow-hidden">
          <span className="text-xs text-primary font-bold uppercase tracking-wider block">Global Occupancy</span>
          <h3 className="text-3xl font-black text-white mt-1">{occupancyRate.toFixed(1)}%</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {totalOccupied} / {totalCapacity} tons occupied.
          </p>
          <div className="absolute top-4 right-4 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-green-500/20 relative overflow-hidden">
          <span className="text-xs text-green-400 font-bold uppercase tracking-wider block">Earnings Balance</span>
          <h3 className="text-3xl font-black text-white mt-1">${balance.toFixed(2)}</h3>
          <p className="text-xs text-muted-foreground mt-1">Cleared rentable payouts.</p>
          <div className="absolute top-4 right-4 h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-green-400" />
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-amber-500/20 relative overflow-hidden">
          <span className="text-xs text-amber-500 font-bold uppercase tracking-wider block">Pending Storage</span>
          <h3 className="text-3xl font-black text-white mt-1">{pendingRequests}</h3>
          <p className="text-xs text-muted-foreground mt-1">Awaiting space confirmation.</p>
          <div className="absolute top-4 right-4 h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-border/40 relative overflow-hidden">
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">Active Leases</span>
          <h3 className="text-3xl font-black text-white mt-1">{activeLeases}</h3>
          <p className="text-xs text-muted-foreground mt-1">Crops currently checked-in.</p>
          <div className="absolute top-4 right-4 h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 glass p-6 rounded-xl space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white font-sans">Recent Space Lease Requests</h3>
            <Link
              href="/dashboard/warehouse_owner/bookings"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <span>View All Bookings</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-6">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No leases requested yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/30 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                    <th className="py-2.5 px-3">Booking ID</th>
                    <th className="py-2.5 px-3">Depositor / Tenant</th>
                    <th className="py-2.5 px-3">Cargo Type</th>
                    <th className="py-2.5 px-3">Daily Rent</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {bookings.slice(0, 4).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs text-white">BKG-{b.id.toUpperCase()}</td>
                      <td className="py-3 px-3 text-xs text-white font-medium">{b.tenantName}</td>
                      <td className="py-3 px-3 text-xs">
                        {b.cropType}
                        <span className="text-[10px] text-muted-foreground block">{b.quantity} tons · {b.duration} days</span>
                      </td>
                      <td className="py-3 px-3 text-xs font-bold text-secondary">${b.totalCost.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          b.status === "completed"
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : b.status === "pending"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            : "bg-primary/10 border-primary/20 text-primary"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ambient/Cold controls & Depot Actions */}
        <div className="glass p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-1.5">
              <ThermometerSun className="h-5 w-5 text-primary" />
              Depot Temperature Index
            </h3>
            
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-border/30">
                <span className="text-xs font-bold text-white block">Rift Valley Cold Hub</span>
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                  <span>Temp: <strong className="text-green-400">4.2°C</strong></span>
                  <span>Humidity: <strong className="text-white">85%</strong></span>
                </div>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-border/30">
                <span className="text-xs font-bold text-white block">Nakuru Dry Silos</span>
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                  <span>Moisture: <strong className="text-green-400">12.8%</strong></span>
                  <span>Temp: <strong className="text-white">22.1°C</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/20 mt-4 space-y-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">Quick Actions</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/dashboard/warehouse_owner/facilities" className="bg-slate-900 hover:bg-slate-800 border border-border/40 text-white font-bold p-2.5 rounded-lg text-center transition-colors">
                List Facility
              </Link>
              <Link href="/dashboard/warehouse_owner/bookings" className="bg-slate-900 hover:bg-slate-800 border border-border/40 text-white font-bold p-2.5 rounded-lg text-center transition-colors">
                Confirm space
              </Link>
              <Link href="/dashboard/warehouse_owner/wallet" className="bg-slate-900 hover:bg-slate-800 border border-border/40 text-white font-bold p-2.5 rounded-lg text-center transition-colors col-span-2">
                Settlements Wallet
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Safety tips */}
      <div className="glass rounded-xl p-6 border border-primary/10">
        <h3 className="text-base font-bold text-white mb-2">Warehouse Safety Advisory</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Maintain strict temperature controls (2-6°C) for seed potatoes and onions to avoid premature sprouting or rot. For maize storage, ensure moisture levels remain below 13.5% prior to sealing silos to prevent toxic aflatoxin contamination.
        </p>
      </div>
    </div>
  )
}
