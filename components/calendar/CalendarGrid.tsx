"use client"

import { CalendarEvent, EventTypeConfig } from "./CalendarBoard"

interface CalendarGridProps {
  viewMonth: number
  viewYear: number
  calendarDays: (number | null)[]
  getEventsForDay: (day: number) => CalendarEvent[]
  eventTypes: EventTypeConfig[]
  onPrevMonth: () => void
  onNextMonth: () => void
  monthsNames: string[]
}

export default function CalendarGrid({
  viewMonth,
  viewYear,
  calendarDays,
  getEventsForDay,
  eventTypes,
  onPrevMonth,
  onNextMonth,
  monthsNames,
}: CalendarGridProps) {
  const today = new Date()

  return (
    <div className="glass p-6 rounded-xl">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onPrevMonth}
          className="text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer px-3 py-1 rounded-lg hover:bg-muted"
        >
          ← Prev
        </button>
        <h3 className="text-lg font-bold text-white">
          {monthsNames[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={onNextMonth}
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
  )
}
