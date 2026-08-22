import React from "react"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import MyWarehouses from "@/app/dashboard/buyer/warehouses/page"
import { useSession } from "@/lib/hooks/useSession"
import { clientApiGet, clientApiPost, clientApiDelete } from "@/lib/api-client"

jest.mock("@/lib/hooks/useSession")
jest.mock("@/lib/api-client")

describe("Buyer MyWarehouses Component", () => {
  const mockSession = {
    session: { user: { id: "buyer-123", email: "buyer@agriflow.com" } },
    loading: false,
  }

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue(mockSession)
    ;(clientApiGet as jest.Mock).mockResolvedValue([
      {
        id: "wh-1",
        name: "Nairobi Central Hub",
        location: "Industrial Area",
        capacity: 1000,
        storageType: "Cold Storage",
        gpsLat: -1.3005,
        gpsLng: 36.8822,
        status: "active",
        createdAt: "2026-08-20T10:00:00Z",
      },
    ])
    ;(clientApiPost as jest.Mock).mockResolvedValue({
      id: "wh-2",
      name: "Mombasa Port Depot",
      location: "Mombasa Port",
      capacity: 2500,
      storageType: "Dry Storage",
      gpsLat: -4.0435,
      gpsLng: 39.6682,
      status: "active",
      createdAt: "2026-08-21T10:00:00Z",
    })
    ;(clientApiDelete as jest.Mock).mockResolvedValue({ success: true })
  })

  test("renders warehouse list and submits new warehouse form", async () => {
    render(<MyWarehouses />)

    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByText("My Warehouse Nodes & Sourcing Profile")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getAllByText("Nairobi Central Hub")[0]).toBeInTheDocument()
    })

    // Fill form
    const nameInput = screen.getByPlaceholderText("Mombasa Port Transit Terminal")
    const locInput = screen.getByPlaceholderText("Shimanzi Road, Mombasa")
    const capInput = screen.getByPlaceholderText("250")

    fireEvent.change(nameInput, { target: { value: "Mombasa Port Depot" } })
    fireEvent.change(locInput, { target: { value: "Mombasa Port" } })
    fireEvent.change(capInput, { target: { value: "2500" } })

    const submitBtn = screen.getByRole("button", { name: "Add Warehouse Depot" })
    
    await act(async () => {
      fireEvent.click(submitBtn)
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(screen.getByText(/registered successfully/i)).toBeInTheDocument()
    })
  })

  test("surfaces schema validation issues for invalid capacity", async () => {
    render(<MyWarehouses />)

    await act(async () => {
      await Promise.resolve()
    })

    fireEvent.change(screen.getByPlaceholderText("Mombasa Port Transit Terminal"), { target: { value: "Depot X" } })
    fireEvent.change(screen.getByPlaceholderText("Shimanzi Road, Mombasa"), { target: { value: "Mombasa" } })
    fireEvent.change(screen.getByPlaceholderText("250"), { target: { value: "-10" } })

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Add Warehouse Depot" }))
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid capacity in tons\./)).toBeInTheDocument()
    })
    expect(clientApiPost).not.toHaveBeenCalled()
  })

  test("deletes warehouse node when user confirms", async () => {
    window.confirm = jest.fn().mockReturnValue(true)
    render(<MyWarehouses />)

    await act(async () => {
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(screen.getAllByText("Nairobi Central Hub")[0]).toBeInTheDocument()
    })

    const deleteBtn = screen.getByTitle("Delete Node")
    await act(async () => {
      fireEvent.click(deleteBtn)
      await Promise.resolve()
    })
  })
})
