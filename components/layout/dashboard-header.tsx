"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Bell, User, LogOut, Globe } from "lucide-react"
import Link from "next/link"

export default function DashboardHeader() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.access_token)
      }
    })
  }, [])

  const fetchProfile = async (userId: string, token: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
      }
    } catch (err) {
      console.error("Error fetching profile in dashboard header:", err)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="h-16 border-b border-border/40 bg-card/50 backdrop-blur flex items-center justify-between px-8">
      <div className="flex items-center space-x-2">
        <Globe className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          AgriFlow Global Intelligence Platform
        </span>
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
        </button>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {profile?.full_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-semibold text-foreground">
                {profile?.full_name || "User"}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {profile?.role || "Agribusiness"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-destructive transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
