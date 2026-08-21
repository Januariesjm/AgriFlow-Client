import { Product } from "@/lib/types"
import {
  Sprout,
  TrendingUp,
  Truck,
  BrainCircuit,
  ShoppingBag,
  Warehouse,
  LucideIcon,
} from "lucide-react"

export interface PriceTickerItem {
  crop: string
  location: string
  price: string
  trend: "up" | "down"
}

export interface MarketplaceFeature {
  title: string
  desc: string
  icon: LucideIcon
}

export interface HomeProduct extends Partial<Product> {
  id: string
  name: string
  category: string
  price: number
  unit: string
  description?: string
  region?: string
  country?: string
  quantity: number
  image?: string
  images?: string[]
  isPlaceholder?: boolean
}

export const PRICE_TICKER_ITEMS: PriceTickerItem[] = [
  { crop: "Maize", location: "Masindi, Western — Uganda", price: "$0.18/kg", trend: "up" },
  { crop: "Maize", location: "Nakuru, Rift Valley — Kenya", price: "$0.22/kg", trend: "down" },
  { crop: "Maize", location: "Dodoma, Central — Tanzania", price: "$0.20/kg", trend: "up" },
  { crop: "Beans", location: "Kabale, Western — Uganda", price: "$0.45/kg", trend: "up" },
  { crop: "Beans", location: "Arusha, Northern — Tanzania", price: "$0.38/kg", trend: "up" },
  { crop: "Beans", location: "Meru, Eastern — Kenya", price: "$0.42/kg", trend: "down" },
  { crop: "Rice", location: "Mwea, Kirinyaga — Kenya", price: "$0.85/kg", trend: "up" },
  { crop: "Rice", location: "Mbeya, Southern Highlands — Tanzania", price: "$0.49/kg", trend: "up" },
  { crop: "Rice", location: "Bugiri, Eastern — Uganda", price: "$0.55/kg", trend: "down" },
  { crop: "Potatoes", location: "Nyandarua, Central — Kenya", price: "$0.30/kg", trend: "up" },
  { crop: "Potatoes", location: "Mbeya, Southern Highlands — Tanzania", price: "$0.25/kg", trend: "down" },
  { crop: "Potatoes", location: "Singida, Central — Tanzania", price: "$0.28/kg", trend: "up" },
  { crop: "Onions", location: "Musanze, Northern — Rwanda", price: "$0.32/kg", trend: "up" },
  { crop: "Onions", location: "Karatu, Arusha — Tanzania", price: "$0.35/kg", trend: "down" },
  { crop: "Onions", location: "Naivasha, Nakuru — Kenya", price: "$0.40/kg", trend: "up" },
  { crop: "Tomatoes", location: "Kajiado, Rift Valley — Kenya", price: "$0.25/kg", trend: "down" },
  { crop: "Tomatoes", location: "Ntungamo, Western — Uganda", price: "$0.20/kg", trend: "up" },
  { crop: "Tomatoes", location: "Morogoro, Eastern — Tanzania", price: "$0.22/kg", trend: "up" },
  { crop: "Cassava", location: "Lira, Northern — Uganda", price: "$0.12/kg", trend: "up" },
  { crop: "Sorghum", location: "Dodoma, Central — Tanzania", price: "$0.25/kg", trend: "down" },
]

export const MARKETPLACE_FEATURES: MarketplaceFeature[] = [
  {
    title: "Product Marketplace",
    desc: "Farmers list harvests before harvesting. Buyers place direct orders.",
    icon: Sprout,
  },
  {
    title: "Price Intelligence",
    desc: "Compare delivered costs including real-time cross-country price comparisons.",
    icon: TrendingUp,
  },
  {
    title: "Transport Optimizer",
    desc: "Auto-match deliveries with transporters using distance & weight calculations.",
    icon: Truck,
  },
  {
    title: "Demand Forecasting",
    desc: "Predict future shortages and expected profits per crop using historical data.",
    icon: BrainCircuit,
  },
  {
    title: "Input Marketplace",
    desc: "Buy quality seed, fertilizers, and equipment from verified regional vendors.",
    icon: ShoppingBag,
  },
  {
    title: "Warehouse Storage",
    desc: "Find and book local or dry/cold warehouses to minimize post-harvest spoil.",
    icon: Warehouse,
  },
]

export const HOME_PLACEHOLDERS: HomeProduct[] = [
  {
    id: "placeholder-1",
    name: "Premium White Maize",
    category: "Grains",
    price: 0.18,
    unit: "kg",
    description: "Moisture-controlled Grade A white maize, perfect for flour milling and storage. Dried naturally.",
    region: "Masindi",
    country: "Uganda",
    quantity: 12000,
    image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600",
    isPlaceholder: true,
  },
  {
    id: "placeholder-2",
    name: "Red Kidney Beans",
    category: "Legumes",
    price: 0.38,
    unit: "kg",
    description: "Sorted and cleaned organic kidney beans. Rich in protein, low moisture, ready for wholesale.",
    region: "Arusha",
    country: "Tanzania",
    quantity: 8500,
    image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=600",
    isPlaceholder: true,
  },
  {
    id: "placeholder-3",
    name: "Mwea Pishori Rice",
    category: "Grains",
    price: 0.85,
    unit: "kg",
    description: "Aromatic pure Pishori rice harvested from the fertile clay soils of Mwea valley.",
    region: "Mwea",
    country: "Kenya",
    quantity: 15000,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600",
    isPlaceholder: true,
  },
  {
    id: "placeholder-4",
    name: "Red Bulb Onions",
    category: "Vegetables",
    price: 0.32,
    unit: "kg",
    description: "Medium-sized, dry-cured red onions. Exceptional shelf life and flavor.",
    region: "Musanze",
    country: "Rwanda",
    quantity: 5000,
    image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=600",
    isPlaceholder: true,
  },
  {
    id: "placeholder-5",
    name: "Irish Shangi Potatoes",
    category: "Tubers",
    price: 0.30,
    unit: "kg",
    description: "Freshly harvested Shangi potatoes, excellent for both household cooking and commercial chips.",
    region: "Nyandarua",
    country: "Kenya",
    quantity: 9000,
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600",
    isPlaceholder: true,
  },
]
