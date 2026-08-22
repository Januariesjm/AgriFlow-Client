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

export const ProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  full_name: z.string(),
  phone: z.string().optional(),
  role: z.enum(["farmer", "buyer", "transporter", "vendor", "warehouse_owner", "admin"]),
  avatar_url: z.string().optional(),
  country: z.string(),
  region: z.string().optional(),
  gps_lat: z.number().optional(),
  gps_lng: z.number().optional(),
  is_verified: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
})

export type ProfileSchemaType = z.infer<typeof ProfileSchema>

export const WalletBalanceSchema = z.object({
  available_balance: z.number(),
  locked_balance: z.number(),
  deposits: z.array(z.object({
    id: z.string(),
    amount: z.number(),
    method: z.string(),
    reference: z.string(),
    status: z.enum(["pending", "completed", "failed"]),
    created_at: z.string(),
  })),
  withdrawals: z.array(z.object({
    id: z.string(),
    amount: z.number(),
    method: z.string(),
    destination: z.string(),
    status: z.enum(["pending", "completed", "failed"]),
    created_at: z.string(),
  })),
})

export type WalletBalance = z.infer<typeof WalletBalanceSchema>

export const ProductSchema = z.object({
  id: z.string(),
  farmer_id: z.string(),
  farm_id: z.string().optional(),
  name: z.string().min(1),
  category: z.string(),
  description: z.string().optional(),
  quantity: z.number(),
  unit: z.string(),
  price: z.number(),
  currency: z.string(),
  country: z.string(),
  region: z.string(),
  gps_lat: z.number(),
  gps_lng: z.number(),
  harvest_date: z.string().optional(),
  quality_grade: z.enum(["A", "B", "C", "Ungraded"]),
  images: z.array(z.string()).optional(),
  status: z.enum(["active", "sold", "expired", "draft"]),
  created_at: z.string(),
})

export type ProductSchemaType = z.infer<typeof ProductSchema>

export const OrderResponseSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  buyer_id: z.string(),
  quantity: z.number(),
  total_price: z.number(),
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
  created_at: z.string(),
})

export type OrderResponse = z.infer<typeof OrderResponseSchema>


