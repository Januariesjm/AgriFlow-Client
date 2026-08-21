"use client"

import { useState } from "react"
import { CalendarDays, Plus, Trash2, Sprout, Check, LucideIcon } from "lucide-react"
import EventForm from "./EventForm"
import {
  getCalendarDays,
  getEventsForDay as getDayEvents,
  filterEventsByMonth,
  getUpcomingEvents,
} from "@/lib/calendar-utils"

export interface CalendarEvent {
  id: string
  title: string
  crop: string
  type: string
  date: string
  notes: string
  completed: boolean
}

export interface EventTypeConfig {
  value: string
  label: string
  icon: LucideIcon
  color: string
}

export interface GuideItem {
  crop: string
  plantMonths: number[]
  harvestMonths: number[]
  season: string
}

interface CalendarBoardProps {
  storageKey: string
  eventTypes: EventTypeConfig[]
  crops: string[]
  title: string
  subtitle: string
  addButtonLabel: string
  upcomingTitle: string
  initialEvents?: CalendarEvent[]
  guideTitle: string
  guideSubtitle: string
  guideData: GuideItem[]
  guideHeaderTip?: string
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function CalendarBoard({
  storageKey,
  eventTypes,
  crops,
  title,
  subtitle,
  addButtonLabel,
  upcomingTitle,
  initialEvents = [],
  guideTitle,
  guideSubtitle,
  guideData,
}: CalendarBoardProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : initialEvents
    }
    return initialEvents
  })

  const [showForm, setShowForm] = useState(false)
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())

  const saveEvents = (updated: CalendarEvent[]) => {
    setEvents(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    }
  }

  const handleAddEvent = (rawEvent: Omit<CalendarEvent, "id" | "completed">) => {
    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...rawEvent,
      completed: false,
    }
    saveEvents([newEvent, ...events])
    setShowForm(false)
  }

  const toggleComplete = (id: string) => {
    saveEvents(events.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e)))
  }

  const removeEvent = (id: string) => {
    saveEvents(events.filter((e) => e.id !== id))
  }

  // Pure functions from calendar-utils
  const currentMonthEvents = filterEventsByMonth(events, viewYear, viewMonth)
  const calendarDays = getCalendarDays(viewYear, viewMonth)
  const getEventsForDay = (day: number) => getDayEvents(events, day, viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const today = new Date()
  const upcoming = getUpcomingEvents(events, 5, today)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            {title}
          </h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow self-start"
        >
          <Plus className="h-4 w-4" />
          <span>{showForm ? "Cancel" : addButtonLabel}</span>
        </button>
      </div>

      {/* Form Child Component */}
      {showForm && (
        <EventForm crops={crops} eventTypes={eventTypes} onAddEvent={handleAddEvent} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prevMonth}
              className="text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer px-3 py-1 rounded-lg hover:bg-muted"
            >
              ← Prev
            </button>
            <h3 className="text-lg font-bold text-white">
              {MONTHS[viewMonth]} {viewYear}
            </h3>
            <button
              onClick={nextMonth}
              className="text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer px-3 py-1 rounded-lg hover:bg-muted"
            >
              Next →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <span key={d} className="text-[10px] text-muted-foreground font-bold uppercase">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={i} />
              const dayEvents = getEventsForDay(day)
              const isToday =
                day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
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
                  <span className={`text-[11px] font-bold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {day}
                  </span>
                  {dayEvents.slice(0, 2).map((e) => {
                    const typeInfo = eventTypes.find((t) => t.value === e.type)
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

        {/* Upcoming List */}
        <div className="glass p-6 rounded-xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-5">{upcomingTitle}</h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 flex-1 flex items-center justify-center">
              No upcoming events scheduled.
            </p>
          ) : (
            <div className="space-y-3 flex-1">
              {upcoming.map((e) => {
                const typeInfo = eventTypes.find((t) => t.value === e.type)
                const Icon = typeInfo?.icon || Sprout
                return (
                  <div
                    key={e.id}
                    className={`p-3 rounded-lg border flex items-start gap-3 ${
                      typeInfo?.color || "bg-slate-900 border-border/20 text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold block truncate">{e.title}</span>
                      <span className="text-[10px] opacity-70 block">
                        {e.crop} · {new Date(e.date).toLocaleDateString()}
                      </span>
                      {e.notes && <span className="text-[10px] opacity-50 block truncate">{e.notes}</span>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => toggleComplete(e.id)}
                        className="p-1 rounded hover:bg-white/10 cursor-pointer"
                        title="Mark complete"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeEvent(e.id)}
                        className="p-1 rounded hover:bg-white/10 cursor-pointer text-red-400"
                        title="Remove"
                      >
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

      {/* Guide Matrix */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" />
          {guideTitle}
        </h3>
        <p className="text-xs text-muted-foreground mb-5">{guideSubtitle}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-2 px-3 text-xs text-muted-foreground font-bold uppercase">Commodity</th>
                {MONTHS.map((m) => (
                  <th key={m} className="text-center py-2 px-1 text-[10px] text-muted-foreground font-bold uppercase w-12">
                    {m}
                  </th>
                ))}
                <th className="text-left py-2 px-3 text-xs text-muted-foreground font-bold uppercase">Season Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {guideData.map((g) => (
                <tr key={g.crop} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 text-sm font-semibold text-white">{g.crop}</td>
                  {MONTHS.map((_, mi) => {
                    const isPlant = g.plantMonths.includes(mi)
                    const isHarvest = g.harvestMonths.includes(mi)
                    return (
                      <td key={mi} className="text-center py-2.5 px-1">
                        {isPlant && isHarvest ? (
                          <span
                            className="inline-block w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-amber-500 border-2 border-slate-900"
                            title="Plant & Harvest"
                          />
                        ) : isPlant ? (
                          <span
                            className="inline-block w-5 h-5 rounded-full bg-green-500/20 border-2 border-green-500/60"
                            title="Planting window"
                          />
                        ) : isHarvest ? (
                          <span
                            className="inline-block w-5 h-5 rounded-full bg-amber-500/20 border-2 border-amber-500/60"
                            title="Harvest window"
                          />
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

      {/* Month Events Table */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-5">
          Activities for {MONTHS[viewMonth]} {viewYear}
        </h3>
        {currentMonthEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No activities scheduled for this month.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-xs uppercase tracking-wider text-muted-foreground font-bold">
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Activity</th>
                  <th className="py-3 px-4 text-left">Crop</th>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-left">Notes</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {currentMonthEvents.map((e) => {
                  const typeInfo = eventTypes.find((t) => t.value === e.type)
                  return (
                    <tr
                      key={e.id}
                      className={`hover:bg-slate-900/40 transition-colors ${e.completed ? "opacity-50" : ""}`}
                    >
                      <td className="py-3 px-4 text-xs text-white font-medium">
                        {new Date(e.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-xs text-white font-semibold">{e.title}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{e.crop}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${typeInfo?.color}`}>
                          {typeInfo?.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground max-w-[200px] truncate">
                        {e.notes || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                            e.completed
                              ? "bg-green-500/10 border-green-500/20 text-green-400"
                              : "bg-slate-950 border-border text-muted-foreground"
                          }`}
                        >
                          {e.completed ? "Done" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => toggleComplete(e.id)}
                          className="p-1.5 rounded text-muted-foreground hover:text-green-400 hover:bg-muted transition-colors cursor-pointer"
                          title="Toggle"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => removeEvent(e.id)}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
