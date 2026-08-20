"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Users, ShoppingBag, DollarSign, Sprout, Award } from "lucide-react"
import { fetchAdminStats } from "@/lib/admin"
import { AdminStats } from "@/lib/schemas"
import { Session } from "@supabase/supabase-js"

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) {
        loadStats(session.access_token)
      } else {
        setLoading(false)
      }
    })
  }, [])

  const loadStats = async (token: string) => {
    try {
      const data = await fetchAdminStats(token)
      setStats(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Platform Control Panel</h1>
        <p className="text-muted-foreground mt-1">
          Monitor users registration, agricultural supply transactions, and network commerce volumes.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        </div>
      ) : !stats ? (
        <p className="text-sm text-muted-foreground text-center">Failed to load platform analytics.</p>
      ) : (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass p-6 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">Total Accounts</span>
                  <h3 className="text-2xl font-black text-white mt-1">{stats.users?.total || 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">Active Listings</span>
                  <h3 className="text-2xl font-black text-white mt-1">{stats.products?.active || 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">Total Contracts</span>
                  <h3 className="text-2xl font-black text-white mt-1">{stats.orders?.total || 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sprout className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">Contract GMV</span>
                  <h3 className="text-2xl font-black text-secondary mt-1">${stats.orders?.revenue || 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Platform breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-6">User Roles Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-border/20 pb-3">
                  <span className="text-muted-foreground font-semibold">Farmers:</span>
                  <span className="text-white font-bold">{stats.users?.farmers || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-border/20 pb-3">
                  <span className="text-muted-foreground font-semibold">Buyers:</span>
                  <span className="text-white font-bold">{stats.users?.buyers || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-semibold">Transporters:</span>
                  <span className="text-white font-bold">{stats.users?.transporters || 0}</span>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-6 font-semibold">Network Quality</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center space-x-3 bg-slate-900/60 p-4 rounded-lg border border-border/40">
                  <Award className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white">High Trust Ratios</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Verify profiles diligently to prevent fake offerings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
