"use client"

import { useState } from "react"
import { CalendarEvent, EventTypeConfig } from "./CalendarBoard"

interface EventFormProps {
  crops: string[]
  eventTypes: EventTypeConfig[]
  onAddEvent: (event: Omit<CalendarEvent, "id" | "completed">) => void
}

export default function EventForm({ crops, eventTypes, onAddEvent }: EventFormProps) {
  const [eventTitle, setEventTitle] = useState("")
  const [crop, setCrop] = useState(crops[0] || "Maize")
  const [type, setType] = useState<string>(eventTypes[0]?.value || "planting")
  const [date, setDate] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventTitle || !date) return

    onAddEvent({
      title: eventTitle,
      crop,
      type,
      date,
      notes,
    })

    setEventTitle("")
    setNotes("")
    setDate("")
  }

  return (
    <div className="glass p-8 rounded-xl">
      <h3 className="text-xl font-bold text-white mb-6">Schedule Event</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Event Title</label>
            <input
              type="text"
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Title..."
              className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Commodity / Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              {crops.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              {eventTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
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
              placeholder="Notes..."
              className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow"
        >
          Save Event
        </button>
      </form>
    </div>
  )
}
