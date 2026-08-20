import { fetchAdminStats, fetchAdminUsers, toggleUserVerification } from "@/lib/admin"
import { api } from "@/lib/api"

jest.mock("@/lib/api")

describe("lib/admin", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("fetchAdminStats", () => {
    it("fetches and validates admin stats successfully", async () => {
      const mockStats = {
        users: { total: 10, farmers: 5, buyers: 3, transporters: 2 },
        products: { active: 15 },
        orders: { total: 8, revenue: 1200 },
      }
      ;(api.get as jest.Mock).mockResolvedValue({ stats: mockStats })

      const stats = await fetchAdminStats("mock-token")
      expect(api.get).toHaveBeenCalledWith("admin/stats", "mock-token")
      expect(stats).toEqual(mockStats)
    })

    it("returns null when API throws error", async () => {
      ;(api.get as jest.Mock).mockRejectedValue(new Error("Network error"))
      const stats = await fetchAdminStats("mock-token")
      expect(stats).toBeNull()
    })
  })

  describe("fetchAdminUsers", () => {
    it("fetches and filters valid users list", async () => {
      const mockUsers = [
        {
          id: "u1",
          email: "farmer@agriflow.com",
          full_name: "John Farmer",
          role: "farmer",
          country: "Kenya",
          is_verified: true,
        },
      ]
      ;(api.get as jest.Mock).mockResolvedValue({ users: mockUsers })

      const users = await fetchAdminUsers("mock-token")
      expect(api.get).toHaveBeenCalledWith("admin/users", "mock-token")
      expect(users).toHaveLength(1)
      expect(users[0].full_name).toBe("John Farmer")
    })

    it("returns empty array on error", async () => {
      ;(api.get as jest.Mock).mockRejectedValue(new Error("Unauthorized"))
      const users = await fetchAdminUsers("mock-token")
      expect(users).toEqual([])
    })
  })

  describe("toggleUserVerification", () => {
    it("calls patch API with toggled verification state", async () => {
      ;(api.patch as jest.Mock).mockResolvedValue({ success: true })
      const result = await toggleUserVerification("token", "u1", false)

      expect(api.patch).toHaveBeenCalledWith("admin/users/u1", { is_verified: true }, "token")
      expect(result).toBe(true)
    })

    it("returns false if toggle API call fails", async () => {
      ;(api.patch as jest.Mock).mockRejectedValue(new Error("Server error"))
      const result = await toggleUserVerification("token", "u1", true)

      expect(result).toBe(false)
    })
  })
})
