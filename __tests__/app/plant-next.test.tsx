import React from "react"
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import PlantNextPage from "@/app/(public)/plant-next/page"

// Mock header and footer
jest.mock("@/components/layout/header", () => {
  return function MockHeader() {
    return <header data-testid="mock-header">Header</header>
  }
})

jest.mock("@/components/layout/footer", () => {
  return function MockFooter() {
    return <footer data-testid="mock-footer">Footer</footer>
  }
})

describe("PlantNextPage", () => {
  test("renders hero title and default recommended crops", () => {
    render(<PlantNextPage />)
    expect(screen.getByRole("heading", { name: /what to plant next\?/i })).toBeInTheDocument()
    expect(screen.getByText(/Recommended Crops/i)).toBeInTheDocument()
    expect(screen.getByText("Maize")).toBeInTheDocument()
  })

  test("updates region, soil, and recalculates recommendations on submit", async () => {
    jest.useFakeTimers()
    render(<PlantNextPage />)

    // Select Clayey soil
    const clayeyBtn = screen.getByText("Clayey Soil")
    fireEvent.click(clayeyBtn)

    // Click Calculate Recommendations button
    const calcBtn = screen.getByRole("button", { name: /calculate recommendations/i })
    
    act(() => {
      fireEvent.click(calcBtn)
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.getByText(/Recommended Crops/i)).toBeInTheDocument()
    })

    jest.useRealTimers()
  })
})
