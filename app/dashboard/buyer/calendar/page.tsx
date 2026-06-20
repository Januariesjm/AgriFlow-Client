"use client"

import { useState } from "react"
import { CalendarDays, Plus, Trash2, Sprout, ShoppingBag, Truck, FileText, Check } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  crop: string
  type: "pickup" | "inspection" | "contract" | "audit"
  date: string
  notes: string
  completed: boolean
}

const EVENT_TYPES = [
  { value: "pickup", label: "Delivery Pickup", icon: Truck, color: "text-green-400 bg-green-500/10 border-green-500/20" },
  { value: "inspection", label: "Quality Inspection", icon: Sprout, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { value: "contract", label: "Contract Renewal", icon: FileText, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { value: "audit", label: "Supplier Audit", icon: ShoppingBag, color: "text-red-400 bg-red-500/10 border-red-500/20" },
]

const CROPS = ["Maize", "Beans", "Rice", "Tomatoes", "Onions", "Potatoes", "Wheat", "Sorghum", "Coffee", "Tea", "Sugarcane", "Cassava"]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Recommended sourcing/harvest calendar for East Africa (when commodities are cheapest)
const HARVEST_GUIDE = [
  { crop: "Maize", plantMonths: [2, 3, 8, 9], harvestMonths: [6, 7, 0, 1], season: "Cheapest sourcing in Jul-Aug & Jan-Feb" },
  { crop: "Beans", plantMonths: [2, 3, 9, 10], harvestMonths: [5, 6, 0, 1], season: "Main supply window Jun-Jul & Jan-Feb" },
  { crop: "Rice", plantMonths: [5, 6], harvestMonths: [10, 11], season: "Peak harvest and supply in Nov-Dec" },
  { crop: "Tomatoes", plantMonths: [0, 1, 7, 8], harvestMonths: [3, 4, 10, 11], season: "Sourcing spikes Apr-May & Nov-Dec" },
  { crop: "Potatoes", plantMonths: [2, 3, 8, 9], harvestMonths: [5, 6, 11, 0], season: "Highland harvest supply Jun-Jul & Dec-Jan" },
  { crop: "Coffee", plantMonths: [3, 4], harvestMonths: [9, 10, 11], season: "Main export sourcing Oct-Dec" },
  { crop: "Tea", plantMonths: [2, 3], harvestMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], season: "Continuous steady sourcing" },
]

export default function BuyerCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("af_buyer_calendar")
      return stored ? JSON.parse(stored) : [
        {
          id: "evt-1",
          title: "Quality inspection for Nairobi maize",
          crop: "Maize",
          type: "inspection",
          date: new Date().toISOString().split("T")[0],
          notes: "Check moisture levels are below 13.5%",
          completed: false
        }
      ]
    }
    return []
  })

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [crop, setCrop] = useState("Maize")
  const [type, setType] = useState<CalendarEvent["type"]>("pickup")
  const [date, setDate] = useState("")
  const [notes, setNotes] = useState("")

  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())

  const saveEvents = (updated: CalendarEvent[]) => {
    setEvents(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("af_buyer_calendar", JSON.stringify(updated))
    }
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      crop,
      type,
      date,
      notes,
      completed: false,
    }
    saveEvents([newEvent, ...events])
    setShowForm(false)
    setTitle("")
    setNotes("")
    setDate("")
  }

  const toggleComplete = (id: string) => {
    saveEvents(events.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e)))
  }

  const removeEvent = (id: string) => {
    saveEvents(events.filter((e) => e.id !== id))
  }

  // Group events by month for current view
  const currentMonthEvents = events.filter((e) => {
    const d = new Date(e.date)
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  const getEventsForDay = (day: number) =>
    events.filter((e) => {
      const d = new Date(e.date)
      return d.getDate() === day && d.getMonth() === viewMonth && d.getFullYear() === viewYear
    })

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const today = new Date()
  const upcoming = events
    .filter((e) => !e.completed && new Date(e.date) >= new Date(today.toDateString()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            Sourcing & Procurement Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Schedule quality inspections, delivery pickups, supplier audits, and monitor regional harvest seasons.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow self-start"
        >
          <Plus className="h-4 w-4" />
          <span>{showForm ? "Cancel" : "Add Sourcing Event"}</span>
        </button>
      </div>

      {/* Add Sourcing Event Form */}
      {showForm && (
        <div className="glass p-8 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-6">Schedule Sourcing Event</h3>
          <form onSubmit={handleAdd} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Inspect beans at Eldoret Depot"
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Commodity</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  {CROPS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Event Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CalendarEvent["type"])}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Scheduled Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Verify moisture content is under limit"
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <button type="submit" className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow">
              Schedule Sourcing Event
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer px-3 py-1 rounded-lg hover:bg-muted">← Prev</button>
            <h3 className="text-lg font-bold text-white">
              {MONTHS[viewMonth]} {viewYear}
            </h3>
            <button onClick={nextMonth} className="text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer px-3 py-1 rounded-lg hover:bg-muted">Next →</button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <span key={d} className="text-[10px] text-muted-foreground font-bold uppercase">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={i} />
              const dayEvents = getEventsForDay(day)
              const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
              return (
                <div
                  key={i}
                  className={`min-h-[60px] rounded-md p-1 border transition-colors ${
                    isToday
                      ? "bg-primary/10 border-primary/30"
                      : dayEvents.length > 0
                      ? "bg-slate-900/60 border-border/40"
                      : "bg-transparent border-border/10"
                  }`}
                >
                  <span className={`text-[11px] font-bold ${isToday ? "text-primary" : "text-muted-foreground"}`}>{day}</span>
                  {dayEvents.slice(0, 2).map((e) => {
                    const typeInfo = EVENT_TYPES.find((t) => t.value === e.type)
                    return (
                      <div
                        key={e.id}
                        className={`text-[8px] leading-tight mt-0.5 px-1 py-0.5 rounded border truncate ${
                          e.completed ? "opacity-40 line-through" : ""
                        } ${typeInfo?.color || "text-muted-foreground bg-slate-900 border-border/20"}`}
                        title={e.title}
                      >
                        {e.crop.substring(0, 3)}: {e.title.substring(0, 12)}
                      </div>
                    )
                  })}
                  {dayEvents.length > 2 && (
                    <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 2} more</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Activities */}
        <div className="glass p-6 rounded-xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-5">Upcoming Milestones</h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 flex-1 flex items-center justify-center">
              No upcoming sourcing activities scheduled.
            </p>
          ) : (
            <div className="space-y-3 flex-1">
              {upcoming.map((e) => {
                const typeInfo = EVENT_TYPES.find((t) => t.value === e.type)
                const Icon = typeInfo?.icon || Sprout
                return (
                  <div key={e.id} className={`p-3 rounded-lg border flex items-start gap-3 ${typeInfo?.color || "bg-slate-900 border-border/20 text-muted-foreground"}`}>
                    <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold block truncate">{e.title}</span>
                      <span className="text-[10px] opacity-70 block">{e.crop} · {new Date(e.date).toLocaleDateString()}</span>
                      {e.notes && <span className="text-[10px] opacity-50 block truncate">{e.notes}</span>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => toggleComplete(e.id)} className="p-1 rounded hover:bg-white/10 cursor-pointer" title="Mark complete">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => removeEvent(e.id)} className="p-1 rounded hover:bg-white/10 cursor-pointer text-red-400" title="Remove">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sourcing / Harvest Seasons Guide */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" />
          East African Sourcing & Harvest Window Guide
        </h3>
        <p className="text-xs text-muted-foreground mb-5">
          Plan commodity buys during these peak regional harvest seasons. Sourcing inside these windows guarantees maximum volume availability and lowest arbitrage rates.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-2 px-3 text-xs text-muted-foreground font-bold uppercase">Commodity</th>
                {MONTHS.map((m) => (
                  <th key={m} className="text-center py-2 px-1 text-[10px] text-muted-foreground font-bold uppercase w-12">{m}</th>
                ))}
                <th className="text-left py-2 px-3 text-xs text-muted-foreground font-bold uppercase">Arbitrage Tips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {HARVEST_GUIDE.map((g) => (
                <tr key={g.crop} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 text-sm font-semibold text-white">{g.crop}</td>
                  {MONTHS.map((_, mi) => {
                    const isPlant = g.plantMonths.includes(mi)
                    const isHarvest = g.harvestMonths.includes(mi)
                    return (
                      <td key={mi} className="text-center py-2.5 px-1">
                        {isPlant && isHarvest ? (
                          <span className="inline-block w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-amber-500 border-2 border-slate-900" title="Plant & Harvest" />
                        ) : isPlant ? (
                          <span className="inline-block w-5 h-5 rounded-full bg-green-500/20 border-2 border-green-500/60" title="Planting window" />
                        ) : isHarvest ? (
                          <span className="inline-block w-5 h-5 rounded-full bg-amber-500/20 border-2 border-amber-500/60" title="Harvest window" />
                        ) : (
                          <span className="inline-block w-5 h-5 rounded-full border-2 border-border/20" />
                        )}
                      </td>
                    )
                  })}
                  <td className="py-2.5 px-3 text-[10px] text-muted-foreground max-w-[180px]">{g.season}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
