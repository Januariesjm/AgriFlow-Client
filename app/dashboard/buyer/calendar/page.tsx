"use client"

import { Sprout, ShoppingBag, Truck, FileText } from "lucide-react"
import CalendarBoard, { EventTypeConfig, GuideItem } from "@/components/calendar/CalendarBoard"

const EVENT_TYPES: EventTypeConfig[] = [
  { value: "pickup", label: "Delivery Pickup", icon: Truck, color: "text-green-400 bg-green-500/10 border-green-500/20" },
  { value: "inspection", label: "Quality Inspection", icon: Sprout, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { value: "contract", label: "Contract Renewal", icon: FileText, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { value: "audit", label: "Supplier Audit", icon: ShoppingBag, color: "text-red-400 bg-red-500/10 border-red-500/20" },
]

const CROPS = ["Maize", "Beans", "Rice", "Tomatoes", "Onions", "Potatoes", "Wheat", "Sorghum", "Coffee", "Tea", "Sugarcane", "Cassava"]

const HARVEST_GUIDE: GuideItem[] = [
  { crop: "Maize", plantMonths: [2, 3, 8, 9], harvestMonths: [6, 7, 0, 1], season: "Cheapest sourcing in Jul-Aug & Jan-Feb" },
  { crop: "Beans", plantMonths: [2, 3, 9, 10], harvestMonths: [5, 6, 0, 1], season: "Main supply window Jun-Jul & Jan-Feb" },
  { crop: "Rice", plantMonths: [5, 6], harvestMonths: [10, 11], season: "Peak harvest and supply in Nov-Dec" },
  { crop: "Tomatoes", plantMonths: [0, 1, 7, 8], harvestMonths: [3, 4, 10, 11], season: "Sourcing spikes Apr-May & Nov-Dec" },
  { crop: "Potatoes", plantMonths: [2, 3, 8, 9], harvestMonths: [5, 6, 11, 0], season: "Highland harvest supply Jun-Jul & Dec-Jan" },
  { crop: "Coffee", plantMonths: [3, 4], harvestMonths: [9, 10, 11], season: "Main export sourcing Oct-Dec" },
  { crop: "Tea", plantMonths: [2, 3], harvestMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], season: "Continuous steady sourcing" },
]

export default function BuyerCalendar() {
  return (
    <CalendarBoard
      storageKey="af_buyer_calendar"
      eventTypes={EVENT_TYPES}
      crops={CROPS}
      title="Sourcing & Procurement Calendar"
      subtitle="Schedule quality inspections, delivery pickups, supplier audits, and monitor regional harvest seasons."
      addButtonLabel="Add Sourcing Event"
      upcomingTitle="Upcoming Milestones"
      guideTitle="East African Sourcing & Harvest Window Guide"
      guideSubtitle="Plan commodity buys during these peak regional harvest seasons. Sourcing inside these windows guarantees maximum volume availability."
      guideData={HARVEST_GUIDE}
    />
  )
}
