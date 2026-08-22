import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import StatusBanner from "@/components/ui/StatusBanner"

describe("StatusBanner", () => {
  test("renders nothing when the message is empty", () => {
    const { container } = render(<StatusBanner variant="success" message="" />)
    expect(container).toBeEmptyDOMElement()
  })

  test("renders a success status with the success palette", () => {
    render(<StatusBanner variant="success" message="Saved successfully!" />)
    const banner = screen.getByRole("status")
    expect(banner).toHaveTextContent("Saved successfully!")
    expect(banner.className).toContain("bg-green-500/10")
  })

  test("renders an error alert with the destructive palette", () => {
    render(<StatusBanner variant="error" message="Something failed." />)
    const banner = screen.getByRole("alert")
    expect(banner).toHaveTextContent("Something failed.")
    expect(banner.className).toContain("bg-destructive/10")
  })

  test("shows an icon and flex layout when withIcon is set", () => {
    render(<StatusBanner variant="error" message="Offline." withIcon />)
    const banner = screen.getByRole("alert")
    expect(banner.className).toContain("flex items-center")
    expect(banner.querySelector("svg")).toBeInTheDocument()
  })

  test("appends custom class names", () => {
    render(<StatusBanner variant="error" message="Spacing." className="mb-6" />)
    expect(screen.getByRole("alert").className).toContain("mb-6")
  })
})
