import { render, screen } from "@testing-library/react"
import WarehouseKpis from "@/components/warehouses/WarehouseKpis"
import { Warehouse } from "@/lib/types"

describe("WarehouseKpis Component", () => {
  const mockWarehouses: Warehouse[] = [
    {
      id: "wh-1",
      name: "Nairobi Hub",
      location: "Industrial Area",
      capacity: 300,
      storageType: "Cold Storage",
      gpsLat: -1.2,
      gpsLng: 36.8,
      status: "active",
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "wh-2",
      name: "Mombasa Depot",
      location: "Port Area",
      capacity: 200,
      storageType: "Silo",
      gpsLat: -4.0,
      gpsLng: 39.6,
      status: "inactive",
      createdAt: "2026-01-02T00:00:00Z",
    },
  ]

  test("calculates active hubs, total capacity, and default hub correctly", () => {
    render(<WarehouseKpis warehouses={mockWarehouses} />)

    expect(screen.getByText("Active Hubs")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument() // 1 active node
    expect(screen.getByText("500 Tons")).toBeInTheDocument() // 300 + 200
    expect(screen.getByText("Nairobi Hub")).toBeInTheDocument()
  })

  test("handles empty warehouse list gracefully", () => {
    render(<WarehouseKpis warehouses={[]} />)

    expect(screen.getByText("0 Tons")).toBeInTheDocument()
    expect(screen.getByText("None configured")).toBeInTheDocument()
  })
})
