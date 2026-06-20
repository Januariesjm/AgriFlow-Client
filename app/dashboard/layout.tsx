"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import DashboardSidebar from "@/components/layout/dashboard-sidebar"
import DashboardHeader from "@/components/layout/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push("/login")
      return
    }

    try {
      const res = await fetch("http://localhost:4000/api/profile", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      if (!res.ok) {
        throw new Error("Failed to fetch profile")
      }
      const data = await res.json()
      const userRole = data.profile?.role
      setRole(userRole)

      // Simple auth guard to ensure user accesses their own role dashboard
      if (pathname.startsWith("/dashboard/") && !pathname.includes(`/dashboard/${userRole}`)) {
        router.push(`/dashboard/${userRole}`)
      }
    } catch (err) {
      console.error(err)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <DashboardSidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
