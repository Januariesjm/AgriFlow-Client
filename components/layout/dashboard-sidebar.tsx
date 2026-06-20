"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Sprout, 
  Home, 
  ShoppingBag, 
  Truck, 
  History, 
  TrendingUp, 
  Settings, 
  Users, 
  BarChart3, 
  Compass,
  FileText,
  Wallet,
  Calendar,
  HelpCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarItem {
  name: string
  href: string
  icon: any
}

interface DashboardSidebarProps {
  role: "farmer" | "buyer" | "transporter" | "admin"
}

export default function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const farmerItems: SidebarItem[] = [
    { name: "Overview", href: `/dashboard/farmer`, icon: Home },
    { name: "My Farm", href: `/dashboard/farmer/farm`, icon: Compass },
    { name: "My Products", href: `/dashboard/farmer/products`, icon: ShoppingBag },
    { name: "Incoming Orders", href: `/dashboard/farmer/orders`, icon: FileText },
    { name: "Price Trends", href: `/dashboard/farmer/prices`, icon: TrendingUp },
    { name: "Crop Calendar", href: `/dashboard/farmer/calendar`, icon: Calendar },
    { name: "Analytics & Reports", href: `/dashboard/farmer/analytics`, icon: BarChart3 },
    { name: "My Wallet", href: `/dashboard/farmer/wallet`, icon: Wallet },
    { name: "Logistics", href: `/dashboard/farmer/logistics`, icon: Truck },
    { name: "Support Center", href: `/dashboard/farmer/support`, icon: HelpCircle },
    { name: "Account Settings", href: `/dashboard/farmer/settings`, icon: Settings },
  ]

  const buyerItems: SidebarItem[] = [
    { name: "Overview", href: `/dashboard/buyer`, icon: Home },
    { name: "Browse Products", href: `/dashboard/buyer/products`, icon: ShoppingBag },
    { name: "Compare Prices", href: `/dashboard/buyer/prices`, icon: TrendingUp },
    { name: "My Orders", href: `/dashboard/buyer/orders`, icon: FileText },
    { name: "Warehouses", href: `/dashboard/buyer/warehouses`, icon: Compass },
    { name: "Inbound Logistics", href: `/dashboard/buyer/logistics`, icon: Truck },
    { name: "Sourcing Calendar", href: `/dashboard/buyer/calendar`, icon: Calendar },
    { name: "Procurement Analytics", href: `/dashboard/buyer/analytics`, icon: BarChart3 },
    { name: "My Wallet", href: `/dashboard/buyer/wallet`, icon: Wallet },
    { name: "Support Center", href: `/dashboard/buyer/support`, icon: HelpCircle },
    { name: "Account Settings", href: `/dashboard/buyer/settings`, icon: Settings },
  ]

  const transporterItems: SidebarItem[] = [
    { name: "Overview", href: `/dashboard/transporter`, icon: Home },
    { name: "Available Jobs", href: `/dashboard/transporter/jobs`, icon: Truck },
    { name: "Current Deliveries", href: `/dashboard/transporter/deliveries`, icon: FileText },
    { name: "My Earnings", href: `/dashboard/transporter/earnings`, icon: History },
  ]

  const adminItems: SidebarItem[] = [
    { name: "Overview", href: `/dashboard/admin`, icon: Home },
    { name: "User Management", href: `/dashboard/admin/users`, icon: Users },
    { name: "All Products", href: `/dashboard/admin/products`, icon: ShoppingBag },
    { name: "All Orders", href: `/dashboard/admin/orders`, icon: FileText },
    { name: "Analytics", href: `/dashboard/admin/analytics`, icon: BarChart3 },
  ]

  const items = 
    role === "farmer" ? farmerItems :
    role === "buyer" ? buyerItems :
    role === "transporter" ? transporterItems :
    adminItems

  return (
    <aside className="w-64 bg-card border-r border-border/40 min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border/40">
        <Link href="/" className="flex items-center space-x-2">
          <Sprout className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Agri<span className="text-primary">Flow</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {items.map((item) => {
          const isActive = mounted && pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border/40">
        <div className="flex items-center space-x-2 px-3 py-2 rounded-md text-xs text-muted-foreground uppercase font-bold tracking-wider">
          Role: <span className="text-primary ml-1">{role}</span>
        </div>
      </div>
    </aside>
  )
}
