import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import WarehouseFacilities from "@/app/dashboard/warehouse_owner/facilities/page"
import MyWarehouses from "@/app/dashboard/buyer/warehouses/page"
import { useSession } from "@/lib/hooks/useSession"

jest.mock("@/lib/hooks/useSession")
jest.mock("@/components/maps/PlaceAutocomplete", () => {
  return function MockPlaceAutocomplete({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return <input data-testid="place-autocomplete" value={value} onChange={(e) => onChange(e.target.value)} />
  }
})
jest.mock("@/components/maps/GoogleMap", () => {
  return function MockGoogleMap() {
    return <div data-testid="google-map">Map</div>
  }
})

describe("Warehouse & Facilities Pages", () => {
  const mockSession = {
    session: {
      user: { id: "user-123", email: "warehouse@agriflow.com" },
      access_token: "token123",
    },
    loading: false,
  }

  beforeEach(() => {
    localStorage.clear()
    ;(useSession as jest.Mock).mockReturnValue(mockSession)
  })

  test("renders WarehouseFacilities page with default facilities", async () => {
    render(<WarehouseFacilities />)

    await waitFor(() => {
      expect(screen.getByText("Warehouse Facilities Directory")).toBeInTheDocument()
      expect(screen.getByText("Rift Valley Cold Hub")).toBeInTheDocument()
    })
  })

  test("surfaces schema validation issues on empty Facility registration submit", async () => {
    const { container } = render(<WarehouseFacilities />)

    const form = container.querySelector("form")!
    fireEvent.submit(form)

    // Zod schema reports missing name, address, and non-positive numeric fields
    await waitFor(() => {
      expect(screen.getByText(/Facility name is required\./)).toBeInTheDocument()
      expect(screen.getByText(/Facility address is required\./)).toBeInTheDocument()
    })
  })

  test("rejects non-positive capacity via schema validation", async () => {
    const { container } = render(<WarehouseFacilities />)

    fireEvent.change(screen.getByPlaceholderText("e.g. Eldoret Grain Terminal"), { target: { value: "Molo Depot" } })
    fireEvent.change(screen.getByTestId("place-autocomplete"), { target: { value: "Molo Town" } })
    fireEvent.change(screen.getByPlaceholderText("500"), { target: { value: "-5" } })
    fireEvent.change(screen.getByPlaceholderText("0.50"), { target: { value: "0.4" } })

    fireEvent.submit(container.querySelector("form")!)

    await waitFor(() => {
      expect(screen.getByText(/Capacity must be a positive number of tons\./)).toBeInTheDocument()
    })
  })

  test("renders MyWarehouses buyer page with active hubs", async () => {
    render(<MyWarehouses />)

    await waitFor(() => {
      expect(screen.getByText("My Warehouse Nodes & Sourcing Profile")).toBeInTheDocument()
      expect(screen.getAllByText("Nairobi Central Depot").length).toBeGreaterThan(0)
    })
  })
})
