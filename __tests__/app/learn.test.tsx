import React from "react"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import LearnPage from "@/app/(public)/learn/page"

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/learn",
}))

describe("Learn Page & Diagnostic Lab", () => {
  test("renders agricultural guides and initial maize tab", () => {
    render(<LearnPage />)

    expect(screen.getByText("Learn How to Plant")).toBeInTheDocument()
    expect(screen.getByText("Maize Planting Guide")).toBeInTheDocument()
    expect(screen.getByText("Land Preparation")).toBeInTheDocument()
  })

  test("switches active crop guide tab", () => {
    render(<LearnPage />)

    const tomatoTab = screen.getByRole("button", { name: /tomato/i })
    fireEvent.click(tomatoTab)

    expect(screen.getByText("Nursery Management")).toBeInTheDocument()
    expect(screen.getByText("Transplanting & Support")).toBeInTheDocument()
  })

  test("runs diagnostic analysis based on selected symptoms", async () => {
    render(<LearnPage />)

    const yellowLeavesCheckbox = screen.getByText("Yellowing leaves")
    const darkSpotsCheckbox = screen.getByText("Dark spots/rings on leaves")

    fireEvent.click(yellowLeavesCheckbox)
    fireEvent.click(darkSpotsCheckbox)

    const diagnoseBtn = screen.getByRole("button", { name: /run diagnostics/i })
    
    await act(async () => {
      fireEvent.click(diagnoseBtn)
      await new Promise((r) => setTimeout(r, 900))
    })

    await waitFor(() => {
      expect(screen.getByText("Early Blight (Fungal)")).toBeInTheDocument()
      expect(screen.getByText("Alternaria solani fungus, triggered by warmth and leaf moisture.")).toBeInTheDocument()
    })
  })
})
