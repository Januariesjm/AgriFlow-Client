import { z } from "zod"

export const AdminStatsSchema = z.object({
  users: z
    .object({
      total: z.number().default(0),
      farmers: z.number().default(0),
      buyers: z.number().default(0),
      transporters: z.number().default(0),
    })
    .optional(),
  products: z
    .object({
      active: z.number().default(0),
    })
    .optional(),
  orders: z
    .object({
      total: z.number().default(0),
      revenue: z.number().default(0),
    })
    .optional(),
})

export type AdminStats = z.infer<typeof AdminStatsSchema>

export const AdminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  full_name: z.string(),
  role: z.enum(["farmer", "buyer", "transporter", "vendor", "warehouse_owner", "admin"]),
  country: z.string(),
  region: z.string().optional(),
  is_verified: z.boolean(),
  created_at: z.string().optional(),
})

export type AdminUser = z.infer<typeof AdminUserSchema>

export const TransportCostEstimateSchema = z.object({
  estimated_cost: z.number(),
  distance_km: z.number(),
})

export type TransportCostEstimate = z.infer<typeof TransportCostEstimateSchema>

export const CreateOrderInputSchema = z.object({
  product_id: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  delivery_lat: z.number(),
  delivery_lng: z.number(),
  delivery_address: z.string(),
  notes: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>

export const WarehouseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  location: z.string(),
  capacity: z.number(),
  storageType: z.string(),
  gpsLat: z.number(),
  gpsLng: z.number(),
  status: z.enum(["active", "inactive"]),
  createdAt: z.string(),
})

export type WarehouseSchemaType = z.infer<typeof WarehouseSchema>

export const FacilitySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  type: z.string(),
  capacity: z.number(),
  occupied: z.number(),
  dailyRate: z.number(),
  address: z.string(),
  gpsLat: z.string(),
  gpsLng: z.string(),
  status: z.enum(["active", "full", "maintenance"]),
})

export type FacilitySchemaType = z.infer<typeof FacilitySchema>

