import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import EquipmentsPage from "@/app/(public)/equipments/page"

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/equipments",
}))

describe("Equipments Marketplace Page", () => {
  test("renders header, categories, and initial equipment listings", () => {
    render(<EquipmentsPage />)

    expect(screen.getByText("Farm Equipment Hub")).toBeInTheDocument()
    expect(screen.getByText("John Deere 5075E Utility Tractor")).toBeInTheDocument()
    expect(screen.getByText("Solar-Powered Drip Irrigation Kit")).toBeInTheDocument()
  })

  test("filters listings by category selection", () => {
    render(<EquipmentsPage />)

    const categorySelect = screen.getAllByRole("combobox")[0]
    fireEvent.change(categorySelect, { target: { value: "Irrigation" } })

    expect(screen.getByText("Solar-Powered Drip Irrigation Kit")).toBeInTheDocument()
    expect(screen.queryByText("John Deere 5075E Utility Tractor")).not.toBeInTheDocument()
  })

  test("filters listings by search query input", () => {
    render(<EquipmentsPage />)

    const searchInput = screen.getByPlaceholderText("Search tractors, pumps, seeders...")
    fireEvent.change(searchInput, { target: { value: "Seeder" } })

    expect(screen.getByText("Manual Multi-Crop Row Seeder")).toBeInTheDocument()
    expect(screen.queryByText("Solar-Powered Drip Irrigation Kit")).not.toBeInTheDocument()
  })

  test("opens rental booking modal when clicking rent button", () => {
    render(<EquipmentsPage />)

    const rentBtns = screen.getAllByRole("button", { name: "Book Rental" })
    fireEvent.click(rentBtns[0])

    expect(screen.getByText("Rental Duration")).toBeInTheDocument()
  })
})
