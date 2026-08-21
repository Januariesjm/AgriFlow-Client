import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import CalendarBoard, { EventTypeConfig, GuideItem } from "@/components/calendar/CalendarBoard"
import { Sprout, Droplets } from "lucide-react"

const TEST_EVENT_TYPES: EventTypeConfig[] = [
  { value: "planting", label: "Planting", icon: Sprout, color: "text-green-400" },
  { value: "watering", label: "Watering", icon: Droplets, color: "text-blue-400" },
]

const TEST_CROPS = ["Maize", "Beans"]

const TEST_GUIDE: GuideItem[] = [
  { crop: "Maize", plantMonths: [2, 3], harvestMonths: [6, 7], season: "Long rains" },
]

describe("CalendarBoard Component", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test("renders board title, subtitle, and guide section", () => {
    render(
      <CalendarBoard
        storageKey="test_calendar"
        eventTypes={TEST_EVENT_TYPES}
        crops={TEST_CROPS}
        title="Test Calendar"
        subtitle="Schedule farm activities"
        addButtonLabel="Add Activity"
        upcomingTitle="Upcoming Activities"
        guideTitle="Planting Guide"
        guideSubtitle="Seasonal guide"
        guideData={TEST_GUIDE}
      />
    )

    expect(screen.getByText("Test Calendar")).toBeInTheDocument()
    expect(screen.getByText("Schedule farm activities")).toBeInTheDocument()
    expect(screen.getByText("Planting Guide")).toBeInTheDocument()
    expect(screen.getByText("Long rains")).toBeInTheDocument()
  })

  test("toggles event creation form", () => {
    render(
      <CalendarBoard
        storageKey="test_calendar"
        eventTypes={TEST_EVENT_TYPES}
        crops={TEST_CROPS}
        title="Test Calendar"
        subtitle="Schedule farm activities"
        addButtonLabel="Add Activity"
        upcomingTitle="Upcoming Activities"
        guideTitle="Planting Guide"
        guideSubtitle="Seasonal guide"
        guideData={TEST_GUIDE}
      />
    )

    const toggleBtn = screen.getByText("Add Activity")
    fireEvent.click(toggleBtn)

    expect(screen.getByText("Schedule Event")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Title...")).toBeInTheDocument()
  })

  test("allows adding a new calendar event and persists to localStorage", () => {
    render(
      <CalendarBoard
        storageKey="test_calendar"
        eventTypes={TEST_EVENT_TYPES}
        crops={TEST_CROPS}
        title="Test Calendar"
        subtitle="Schedule farm activities"
        addButtonLabel="Add Activity"
        upcomingTitle="Upcoming Activities"
        guideTitle="Planting Guide"
        guideSubtitle="Seasonal guide"
        guideData={TEST_GUIDE}
      />
    )

    fireEvent.click(screen.getByText("Add Activity"))

    fireEvent.change(screen.getByPlaceholderText("Title..."), { target: { value: "Planting Maize Lot A" } })
    fireEvent.change(screen.getByPlaceholderText("Notes..."), { target: { value: "50kg DAP" } })

    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: "2026-09-15" } })
    }

    fireEvent.click(screen.getByText("Save Event"))

    const stored = localStorage.getItem("test_calendar")
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].title).toBe("Planting Maize Lot A")
  })
})
