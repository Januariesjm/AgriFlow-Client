import { render, screen, fireEvent } from "@testing-library/react"
import CalendarGrid from "@/components/calendar/CalendarGrid"

describe("CalendarGrid Component", () => {
  const mockEvents = [
    {
      id: "e1",
      title: "Sow Maize Seeds",
      crop: "Maize",
      type: "planting",
      date: "2026-08-15",
      notes: "High yield strain",
      completed: false,
    },
  ]

  const mockProps = {
    viewMonth: 7, // August
    viewYear: 2026,
    calendarDays: [null, null, 1, 2, 3, 4, 5, 15],
    getEventsForDay: (day: number) => (day === 15 ? mockEvents : []),
    eventTypes: [
      { value: "planting", label: "Planting", icon: () => null, color: "bg-green-500" },
    ],
    onPrevMonth: jest.fn(),
    onNextMonth: jest.fn(),
    monthsNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  }

  test("renders month heading and navigates correctly", () => {
    render(<CalendarGrid {...mockProps} />)

    expect(screen.getByText("Aug 2026")).toBeInTheDocument()

    const prevBtn = screen.getByText("← Prev")
    const nextBtn = screen.getByText("Next →")

    fireEvent.click(prevBtn)
    expect(mockProps.onPrevMonth).toHaveBeenCalledTimes(1)

    fireEvent.click(nextBtn)
    expect(mockProps.onNextMonth).toHaveBeenCalledTimes(1)
  })

  test("renders events on specific calendar day", () => {
    render(<CalendarGrid {...mockProps} />)

    expect(screen.getByText("Mai: Sow Maize Se")).toBeInTheDocument()
  })
})
