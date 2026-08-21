"use client"

import { Sprout, Droplets, Sun, Bug, Scissors } from "lucide-react"
import CalendarBoard, { EventTypeConfig, GuideItem } from "@/components/calendar/CalendarBoard"

const EVENT_TYPES: EventTypeConfig[] = [
  { value: "planting", label: "Planting", icon: Sprout, color: "text-green-400 bg-green-500/10 border-green-500/20" },
  { value: "watering", label: "Irrigation / Watering", icon: Droplets, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { value: "fertilizing", label: "Fertilizing", icon: Sun, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { value: "pest_control", label: "Pest Control", icon: Bug, color: "text-red-400 bg-red-500/10 border-red-500/20" },
  { value: "harvesting", label: "Harvesting", icon: Scissors, color: "text-primary bg-primary/10 border-primary/20" },
]

const CROPS = ["Maize", "Beans", "Rice", "Tomatoes", "Onions", "Potatoes", "Wheat", "Sorghum", "Coffee", "Tea", "Sugarcane", "Cassava"]

const PLANTING_GUIDE: GuideItem[] = [
  { crop: "Maize", plantMonths: [2, 3, 8, 9], harvestMonths: [6, 7, 0, 1], season: "Long rains (Mar-Apr) & Short rains (Sep-Oct)" },
  { crop: "Beans", plantMonths: [2, 3, 9, 10], harvestMonths: [5, 6, 0, 1], season: "Dual-season (Mar-Apr & Oct-Nov)" },
  { crop: "Rice", plantMonths: [5, 6], harvestMonths: [10, 11], season: "Irrigated paddies (Jun-Jul)" },
  { crop: "Tomatoes", plantMonths: [0, 1, 7, 8], harvestMonths: [3, 4, 10, 11], season: "Year-round in irrigated farms" },
  { crop: "Potatoes", plantMonths: [2, 3, 8, 9], harvestMonths: [5, 6, 11, 0], season: "Highland crops (Mar-Apr & Sep-Oct)" },
  { crop: "Coffee", plantMonths: [3, 4], harvestMonths: [9, 10, 11], season: "Perennial — main harvest Oct-Dec" },
  { crop: "Tea", plantMonths: [2, 3], harvestMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], season: "Year-round plucking" },
  { crop: "Sugarcane", plantMonths: [2, 3, 8, 9], harvestMonths: [0, 1, 2, 8, 9, 10], season: "12-18 month growth cycle" },
]

export default function CropCalendar() {
  return (
    <CalendarBoard
      storageKey="af_crop_calendar"
      eventTypes={EVENT_TYPES}
      crops={CROPS}
      title="Crop Calendar & Planner"
      subtitle="Schedule planting, irrigation, fertilization, pest control, and harvest activities."
      addButtonLabel="Add Activity"
      upcomingTitle="Upcoming Activities"
      guideTitle="East African Planting Guide"
      guideSubtitle="Recommended planting and harvesting windows for key crops in East Africa. Adjust based on your specific altitude and microclimate."
      guideData={PLANTING_GUIDE}
    />
  )
}
