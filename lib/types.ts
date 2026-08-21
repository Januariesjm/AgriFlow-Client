export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  role: "farmer" | "buyer" | "transporter" | "vendor" | "warehouse_owner" | "admin"
  avatar_url?: string
  country: string
  region?: string
  gps_lat?: number
  gps_lng?: number
  is_verified: boolean
  created_at: string
  updated_at?: string
}

export interface Farm {
  id: string
  farmer_id: string
  name: string
  location: string
  country: string
  region: string
  farm_size?: number
  soil_type?: string
  water_source?: string
  gps_lat: number
  gps_lng: number
  created_at: string
}

export interface Product {
  id: string
  farmer_id: string
  farm_id?: string
  name: string
  category: string
  description?: string
  quantity: number
  unit: string
  price: number
  currency: string
  country: string
  region: string
  gps_lat: number
  gps_lng: number
  harvest_date?: string
  quality_grade: "A" | "B" | "C" | "Ungraded"
  images?: string[]
  status: "active" | "sold" | "expired" | "draft"
  created_at: string
  profiles?: {
    full_name: string
    avatar_url?: string
    country: string
    region?: string
    phone?: string
  }
}

export interface Order {
  id: string
  buyer_id: string
  product_id: string
  farmer_id: string
  quantity: number
  unit_price: number
  total_price: number
  transport_cost: number
  status: "pending" | "confirmed" | "in_transit" | "delivered" | "cancelled"
  delivery_lat?: number
  delivery_lng?: number
  delivery_address?: string
  notes?: string
  created_at: string
  product?: {
    name: string
    category: string
    images?: string[]
    unit: string
    farm_id?: string
  }
  buyer?: {
    full_name: string
    email: string
    phone?: string
    country?: string
  }
  farmer?: {
    full_name: string
    email: string
    phone?: string
    country?: string
  }
}

export interface Vehicle {
  id: string
  transporter_id: string
  type: string
  capacity_tons: number
  plate_number: string
  price_per_km: number
  is_available: boolean
  current_lat?: number
  current_lng?: number
  profiles?: {
    full_name: string
    phone?: string
    country: string
    region?: string
  }
}

export interface TransportRequest {
  id: string
  order_id?: string
  requester_id: string
  vehicle_id?: string
  transporter_id?: string
  pickup_lat: number
  pickup_lng: number
  delivery_lat: number
  delivery_lng: number
  distance_km?: number
  estimated_cost?: number
  payload_weight?: number
  status: "pending" | "accepted" | "in_transit" | "completed" | "cancelled"
  created_at: string
  vehicle?: Vehicle
}

export interface PriceHistory {
  id: string
  product_name: string
  crop?: string
  category: string
  country: string
  region?: string
  price: number
  avg_price?: number
  min_price?: number
  max_price?: number
  unit: string
  currency: string
  recorded_at: string
}

export interface ComparisonItem {
  farmer_id?: string
  farmer_name?: string
  country?: string
  distance_km?: number
  base_price?: number
  avg_price?: number
  transport_cost?: number
  transport_estimate?: number
  total_landed_cost?: number
  delivered_cost?: number
  quality_grade?: string
}

export interface Withdrawal {
  id: string
  amount: number
  method: string
  destination: string
  status: "pending" | "completed" | "failed"
  created_at: string
}

export interface Deposit {
  id: string
  amount: number
  method: string
  reference: string
  status: "pending" | "completed" | "failed"
  created_at: string
}

export interface PayoutConfig {
  payoutMethod: "mobile_money" | "bank"
  mobileProvider: string
  mobilePhone: string
  bankName: string
  accountName: string
  accountNumber: string
}

export interface NotificationPrefs {
  emailNotifs: boolean
  orderNotifs: boolean
  priceAlerts: boolean
  weatherAlerts?: boolean
  maxSourcingRange?: string
}

export interface Facility {
  id: string
  name: string
  type: string
  capacity: number
  occupied: number
  dailyRate: number
  address: string
  gpsLat: string
  gpsLng: string
  status: "active" | "full" | "maintenance"
}

export interface Warehouse {
  id: string
  name: string
  location: string
  capacity: number
  storageType: string
  gpsLat: number
  gpsLng: number
  status: "active" | "inactive"
  createdAt: string
}

