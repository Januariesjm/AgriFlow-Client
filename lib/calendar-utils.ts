import { CalendarEvent } from "@/components/calendar/CalendarBoard"

export function getCalendarDays(viewYear: number, viewMonth: number): (number | null)[] {
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const calendarDays: (number | null)[] = []

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  return calendarDays
}

export function getEventsForDay(
  events: CalendarEvent[],
  day: number,
  viewYear: number,
  viewMonth: number
): CalendarEvent[] {
  return events.filter((e) => {
    const d = new Date(e.date)
    return d.getDate() === day && d.getMonth() === viewMonth && d.getFullYear() === viewYear
  })
}

export function filterEventsByMonth(
  events: CalendarEvent[],
  viewYear: number,
  viewMonth: number
): CalendarEvent[] {
  return events
    .filter((e) => {
      const d = new Date(e.date)
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function getUpcomingEvents(
  events: CalendarEvent[],
  maxCount: number = 5,
  referenceDate: Date = new Date()
): CalendarEvent[] {
  const todayStr = referenceDate.toDateString()
  const todayDate = new Date(todayStr)

  return events
    .filter((e) => !e.completed && new Date(e.date) >= todayDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, maxCount)
}
