import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import WarehouseSettings from "@/app/dashboard/warehouse_owner/settings/page"
import { clientApiGet, clientApiPatch } from "@/lib/api-client"
import { supabase } from "@/lib/supabase"

jest.mock("@/lib/api-client")
jest.mock("@/lib/supabase")

describe("WarehouseSettings Page Component", () => {
  const mockProfile = {
    id: "wh-owner-1",
    email: "warehouse@agriflow.com",
    full_name: "Sarah Logistics",
    phone: "254722000000",
    role: "warehouse_owner",
    country: "Kenya",
    region: "Rift Valley",
    is_verified: true,
    created_at: "2026-01-01T00:00:00Z",
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(clientApiGet as jest.Mock).mockResolvedValue({ profile: mockProfile })
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: "wh-owner-1" } } },
    })
  })

  test("loads profile and renders settings form", async () => {
    render(<WarehouseSettings />)

    await waitFor(() => {
      expect(screen.getByDisplayValue("Sarah Logistics")).toBeInTheDocument()
      expect(screen.getByDisplayValue("254722000000")).toBeInTheDocument()
    })
  })

  test("handles profile save success path", async () => {
    ;(clientApiPatch as jest.Mock).mockResolvedValue({
      profile: { ...mockProfile, full_name: "Sarah Updated" },
    })

    render(<WarehouseSettings />)

    await waitFor(() => {
      expect(screen.getByDisplayValue("Sarah Logistics")).toBeInTheDocument()
    })

    const nameInput = screen.getByDisplayValue("Sarah Logistics")
    fireEvent.change(nameInput, { target: { value: "Sarah Updated" } })

    const saveBtn = screen.getByRole("button", { name: /save settings/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(clientApiPatch).toHaveBeenCalledWith("profile", {
        full_name: "Sarah Updated",
        phone: "254722000000",
        country: "Kenya",
        region: "Rift Valley",
      })
      expect(screen.getByText(/profile settings saved successfully/i)).toBeInTheDocument()
    })
  })

  test("handles profile save error path", async () => {
    ;(clientApiPatch as jest.Mock).mockRejectedValue(new Error("Network update failed"))

    render(<WarehouseSettings />)

    await waitFor(() => {
      expect(screen.getByDisplayValue("Sarah Logistics")).toBeInTheDocument()
    })

    const saveBtn = screen.getByRole("button", { name: /save settings/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(screen.getByText("Network update failed")).toBeInTheDocument()
    })
  })

  test("handles password change validation error for short password", async () => {
    render(<WarehouseSettings />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Min. 6 characters")).toBeInTheDocument()
    })

    const newPassInput = screen.getByPlaceholderText("Min. 6 characters")
    const repeatPassInput = screen.getByPlaceholderText("Repeat password")

    fireEvent.change(newPassInput, { target: { value: "123" } })
    fireEvent.change(repeatPassInput, { target: { value: "123" } })

    const changePassBtn = screen.getByRole("button", { name: /change password/i })
    fireEvent.click(changePassBtn)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters long/i)).toBeInTheDocument()
    })
  })

  test("handles password change validation error for mismatch", async () => {
    render(<WarehouseSettings />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Min. 6 characters")).toBeInTheDocument()
    })

    const newPassInput = screen.getByPlaceholderText("Min. 6 characters")
    const repeatPassInput = screen.getByPlaceholderText("Repeat password")

    fireEvent.change(newPassInput, { target: { value: "password123" } })
    fireEvent.change(repeatPassInput, { target: { value: "password456" } })

    const changePassBtn = screen.getByRole("button", { name: /change password/i })
    fireEvent.click(changePassBtn)

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  test("handles password change success path", async () => {
    ;(supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null })

    render(<WarehouseSettings />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Min. 6 characters")).toBeInTheDocument()
    })

    const newPassInput = screen.getByPlaceholderText("Min. 6 characters")
    const repeatPassInput = screen.getByPlaceholderText("Repeat password")

    fireEvent.change(newPassInput, { target: { value: "newsecure123" } })
    fireEvent.change(repeatPassInput, { target: { value: "newsecure123" } })

    const changePassBtn = screen.getByRole("button", { name: /change password/i })
    fireEvent.click(changePassBtn)

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: "newsecure123" })
      expect(screen.getByText(/password changed successfully/i)).toBeInTheDocument()
    })
  })
})
