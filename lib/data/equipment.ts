export interface EquipmentItem {
  id: number
  name: string
  category: string
  type: string
  price: number
  unit: string
  region: string
  rating: number
  reviews: number
  image: string
  specs: string
  provider: string
  available: boolean
}

export const EQUIPMENT_LISTINGS: EquipmentItem[] = [
  {
    id: 1,
    name: "John Deere 5075E Utility Tractor",
    category: "Tractors",
    type: "rent",
    price: 45,
    unit: "day",
    region: "Rift Valley, Kenya",
    rating: 4.8,
    reviews: 14,
    image: "🚜",
    specs: "75 HP, 4WD, dual rear valves, fits heavy plough attachments.",
    provider: "Elgeyo Machinery Ltd",
    available: true,
  },
  {
    id: 2,
    name: "Solar-Powered Drip Irrigation Kit",
    category: "Irrigation",
    type: "buy",
    price: 680,
    unit: "kit",
    region: "Central Kenya",
    rating: 4.9,
    reviews: 32,
    image: "💧",
    specs: "Covers 1 acre, includes 100W panel, pump, filters, and 500m pipes.",
    provider: "SolarAgri East Africa",
    available: true,
  },
  {
    id: 3,
    name: "Manual Multi-Crop Row Seeder",
    category: "Seeders",
    type: "buy",
    price: 180,
    unit: "unit",
    region: "Kampala, Uganda",
    rating: 4.6,
    reviews: 8,
    image: "🌱",
    specs: "Adjustable spacing for maize, soy, beans, and sorghum. Hand-pushed.",
    provider: "Kampala Agro Tools",
    available: true,
  },
  {
    id: 4,
    name: "Kubota DC-70 Combined Harvester",
    category: "Harvesters",
    type: "rent",
    price: 120,
    unit: "day",
    region: "Morogoro, Tanzania",
    rating: 5.0,
    reviews: 21,
    image: "🌾",
    specs: "70 HP diesel, includes paddy/wheat cutting header, operator provided.",
    provider: "Tanzania Rice Machineries",
    available: true,
  },
  {
    id: 5,
    name: "Heavy-Duty Disc Harrow (Tractor attachment)",
    category: "Tractors",
    type: "rent",
    price: 20,
    unit: "day",
    region: "Nakuru, Kenya",
    rating: 4.5,
    reviews: 5,
    image: "⚙️",
    specs: "16 disc, 2.2m working width. High penetration for dry soil breaking.",
    provider: "Rift Valley Rentals",
    available: false,
  },
  {
    id: 6,
    name: "Sprinkler Rain-Gun Kit (Gasoline powered)",
    category: "Irrigation",
    type: "rent",
    price: 15,
    unit: "day",
    region: "Kigali Province, Rwanda",
    rating: 4.7,
    reviews: 12,
    image: "🔫",
    specs: "5.5 HP pump, 30m spraying radius. Includes 6 suction/delivery hoses.",
    provider: "Rwanda Green Tech",
    available: true,
  },
]

export function filterEquipment(
  listings: EquipmentItem[],
  query: string,
  category: string,
  type: string
): EquipmentItem[] {
  return listings.filter((item) => {
    const matchesSearch =
      query.trim() === "" ||
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.specs.toLowerCase().includes(query.toLowerCase()) ||
      item.region.toLowerCase().includes(query.toLowerCase())

    const matchesCategory = category === "All" || item.category === category
    const matchesType = type === "All" || item.type === type

    return matchesSearch && matchesCategory && matchesType
  })
}
