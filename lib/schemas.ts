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

// --- Form boundary schemas ---
// Validate raw controlled-input values (strings) before a payload leaves the
// client, so every form submits through the same rules as the API layer.

const gpsLatField = z.coerce
  .number({ invalid_type_error: "GPS latitude must be numeric." })
  .min(-90, "GPS latitude must be between -90 and 90.")
  .max(90, "GPS latitude must be between -90 and 90.")

const gpsLngField = z.coerce
  .number({ invalid_type_error: "GPS longitude must be numeric." })
  .min(-180, "GPS longitude must be between -180 and 180.")
  .max(180, "GPS longitude must be between -180 and 180.")

export const FacilityFormSchema = z.object({
  name: z.string().trim().min(1, "Facility name is required."),
  type: z.string().trim().min(1, "Storage type is required."),
  capacity: z.coerce
    .number({ invalid_type_error: "Capacity must be a number." })
    .positive("Capacity must be a positive number of tons."),
  dailyRate: z.coerce
    .number({ invalid_type_error: "Daily rate must be a number." })
    .positive("Daily rate must be a positive amount."),
  address: z.string().trim().min(1, "Facility address is required."),
  gpsLat: gpsLatField,
  gpsLng: gpsLngField,
  status: z.enum(["active", "full", "maintenance"]),
})

export type FacilityFormInput = z.infer<typeof FacilityFormSchema>

export const ProductFormSchema = z.object({
  name: z.string().trim().min(1, "Crop name is required."),
  category: z.string().trim().min(1, "Category is required."),
  description: z.string().trim().optional(),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity must be a number." })
    .positive("Quantity must be a positive number."),
  unit: z.string().trim().min(1, "Listing unit is required."),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number." })
    .positive("Price must be a positive amount."),
  gpsLat: gpsLatField,
  gpsLng: gpsLngField,
  harvestDate: z.string().optional(),
  qualityGrade: z.enum(["A", "B", "C", "Ungraded"]),
  farmId: z.string().optional(),
})

export type ProductFormInput = z.infer<typeof ProductFormSchema>

export const WarehouseFormSchema = z.object({
  name: z.string().trim().min(1, "Warehouse name is required."),
  location: z.string().trim().min(1, "Warehouse location is required."),
  capacity: z.coerce
    .number({ invalid_type_error: "Capacity must be a number." })
    .positive("Please enter a valid capacity in tons."),
  storageType: z.string().trim().min(1, "Storage type is required."),
  gpsLat: gpsLatField,
  gpsLng: gpsLngField,
  status: z.enum(["active", "inactive"]),
})

export type WarehouseFormInput = z.infer<typeof WarehouseFormSchema>

/** Flattens a ZodError into a single user-facing message string. */
export function formatZodIssues(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(" ")
}


