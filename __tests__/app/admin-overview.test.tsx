import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import AdminOverview from "@/app/dashboard/admin/page"
import { fetchAdminStats } from "@/lib/admin"
import { supabase } from "@/lib/supabase"

jest.mock("@/lib/admin")
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}))

describe("AdminOverview Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: {
        session: { access_token: "test-admin-token" },
      },
    })
  })

  it("renders page header and stat metrics once data loads", async () => {
    ;(fetchAdminStats as jest.Mock).mockResolvedValue({
      users: { total: 100, farmers: 60, buyers: 30, transporters: 10 },
      products: { active: 45 },
      orders: { total: 200, revenue: 15000 },
    })

    render(<AdminOverview />)

    expect(screen.getByText("Platform Control Panel")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("100")).toBeInTheDocument()
      expect(screen.getByText("45")).toBeInTheDocument()
      expect(screen.getByText("200")).toBeInTheDocument()
      expect(screen.getByText("$15000")).toBeInTheDocument()
    })

    expect(fetchAdminStats).toHaveBeenCalledWith("test-admin-token")
  })

  it("renders fallback message when stats fail to load", async () => {
    ;(fetchAdminStats as jest.Mock).mockResolvedValue(null)

    render(<AdminOverview />)

    await waitFor(() => {
      expect(screen.getByText("Failed to load platform analytics.")).toBeInTheDocument()
    })
  })
})
