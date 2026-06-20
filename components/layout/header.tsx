"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"
import { Sprout, User, LogOut, LayoutDashboard } from "lucide-react"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname() || ""
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/profile`, {
        headers: {
          Authorization: `Bearer ${session?.access_token || (await supabase.auth.getSession()).data.session?.access_token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
      }
    } catch (err) {
      console.error("Error fetching profile in header:", err)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const isActive = (path: string) => {
    return mounted && pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <Sprout className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Agri<span className="text-primary">Flow</span>
          </span>
        </Link>

        <nav className="hidden lg:flex space-x-6 xl:space-x-8">
          <Link 
            href="/products" 
            className={`text-sm font-medium transition-colors ${
              isActive("/products") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Buy from farmers
          </Link>
          <Link 
            href="/sell" 
            className={`text-sm font-medium transition-colors ${
              isActive("/sell") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sell your produce
          </Link>
          <Link 
            href="/plant-next" 
            className={`text-sm font-medium transition-colors ${
              isActive("/plant-next") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            What to plant next
          </Link>
          <Link 
            href="/equipments" 
            className={`text-sm font-medium transition-colors ${
              isActive("/equipments") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Farm equipments
          </Link>
          <Link 
            href="/learn" 
            className={`text-sm font-medium transition-colors ${
              isActive("/learn") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Learn how to plant
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {session ? (
            <div className="flex items-center space-x-4">
              {profile && (
                <Link
                  href={`/dashboard/${profile.role}`}
                  className="flex items-center space-x-1 text-sm font-medium text-primary hover:underline"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              )}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="hidden sm:inline">{profile?.full_name || session.user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm font-medium text-destructive hover:underline cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/95 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
