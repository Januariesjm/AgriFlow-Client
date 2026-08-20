import { api } from "./api"
import { AdminStats, AdminStatsSchema, AdminUser, AdminUserSchema } from "./schemas"

export async function fetchAdminStats(token: string): Promise<AdminStats | null> {
  try {
    const data = await api.get<{ stats?: AdminStats }>("admin/stats", token)
    if (data?.stats) {
      const parsed = AdminStatsSchema.safeParse(data.stats)
      return parsed.success ? parsed.data : data.stats
    }
    return null
  } catch (err) {
    console.error("Failed to fetch admin stats:", err)
    return null
  }
}

export async function fetchAdminUsers(token: string): Promise<AdminUser[]> {
  try {
    const data = await api.get<{ users?: AdminUser[] }>("admin/users", token)
    if (Array.isArray(data?.users)) {
      return data.users.filter((user) => AdminUserSchema.safeParse(user).success)
    }
    return []
  } catch (err) {
    console.error("Failed to fetch admin users:", err)
    return []
  }
}

export async function toggleUserVerification(
  token: string,
  userId: string,
  currentStatus: boolean
): Promise<boolean> {
  try {
    await api.patch(`admin/users/${userId}`, { is_verified: !currentStatus }, token)
    return true
  } catch (err) {
    console.error("Failed to toggle user verification status:", err)
    return false
  }
}
