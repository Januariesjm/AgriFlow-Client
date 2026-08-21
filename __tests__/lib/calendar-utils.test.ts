import {
  getCalendarDays,
  getEventsForDay,
  filterEventsByMonth,
  getUpcomingEvents,
} from "@/lib/calendar-utils"
import { CalendarEvent } from "@/components/calendar/CalendarBoard"

describe("Calendar Utilities", () => {
  const sampleEvents: CalendarEvent[] = [
    {
      id: "evt-1",
      title: "Maize Planting",
      crop: "Maize",
      type: "planting",
      date: "2026-08-15",
      notes: "Planting season",
      completed: false,
    },
    {
      id: "evt-2",
      title: "Fertilizer Application",
      crop: "Maize",
      type: "fertilizing",
      date: "2026-08-20",
      notes: "Top dressing",
      completed: true,
    },
    {
      id: "evt-3",
      title: "Beans Harvest",
      crop: "Beans",
      type: "harvesting",
      date: "2026-09-01",
      notes: "Harvest time",
      completed: false,
    },
  ]

  describe("getCalendarDays", () => {
    test("returns correct grid of null padded days for August 2026", () => {
      // Aug 1 2026 is Saturday (day 6 of week)
      const days = getCalendarDays(2026, 7) // 7 = August (0-indexed)
      expect(days.slice(0, 6)).toEqual([null, null, null, null, null, null])
      expect(days[6]).toBe(1)
      expect(days[days.length - 1]).toBe(31)
    })
  })

  describe("getEventsForDay", () => {
    test("filters events matching specific day and month", () => {
      const result = getEventsForDay(sampleEvents, 15, 2026, 7)
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe("Maize Planting")
    })

    test("returns empty array when no events match day", () => {
      const result = getEventsForDay(sampleEvents, 1, 2026, 7)
      expect(result).toHaveLength(0)
    })
  })

  describe("filterEventsByMonth", () => {
    test("filters and sorts events for August 2026", () => {
      const result = filterEventsByMonth(sampleEvents, 2026, 7)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe("evt-1")
      expect(result[1].id).toBe("evt-2")
    })
  })

  describe("getUpcomingEvents", () => {
    test("returns uncompleted future events relative to reference date", () => {
      const refDate = new Date("2026-08-10")
      const upcoming = getUpcomingEvents(sampleEvents, 5, refDate)
      expect(upcoming).toHaveLength(2)
      expect(upcoming[0].id).toBe("evt-1")
      expect(upcoming[1].id).toBe("evt-3")
    })
  })
})
