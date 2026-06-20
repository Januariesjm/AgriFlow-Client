"use client"

import { useState } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { 
  Wrench, 
  Search, 
  Filter, 
  MapPin, 
  Check, 
  Star,
  X,
  Calendar,
  Truck,
  ShieldAlert,
  Info
} from "lucide-react"

// Mock equipment listings
const EQUIPMENT_LISTINGS = [
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
    available: true
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
    available: true
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
    available: true
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
    available: true
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
    available: false
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
    available: true
  }
]

export default function EquipmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedType, setSelectedType] = useState("All") // All, rent, buy
  
  // Booking modal state
  const [bookingItem, setBookingItem] = useState<any>(null)
  const [bookingDays, setBookingDays] = useState(3)
  const [bookingAddress, setBookingAddress] = useState("")
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [loadingBooking, setLoadingBooking] = useState(false)

  // Filter listings
  const filteredListings = EQUIPMENT_LISTINGS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.specs.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesType = selectedType === "All" || item.type === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

  const handleOpenBooking = (item: any) => {
    setBookingItem(item)
    setBookingConfirmed(false)
    setBookingAddress("")
    setBookingDays(3)
  }

  const handleConfirmBooking = () => {
    setLoadingBooking(true)
    setTimeout(() => {
      setLoadingBooking(false)
      setBookingConfirmed(true)
    }, 1200)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-foreground">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Title */}
        <section className="text-center max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-6">
            <Wrench className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 tracking-wide">
              AgriFlow Regional Machinery Network
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
            Farm Equipment Hub
          </h1>
          <p className="text-lg text-muted-foreground">
            Rent heavy machinery or buy agricultural inputs from verified dealers with secure local deliveries and support services.
          </p>
        </section>

        {/* Filters and Search */}
        <section className="glass p-6 rounded-xl border border-border/40 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tractors, pumps, seeders..."
              className="w-full bg-slate-900 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
            
            {/* Category Select */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-primary" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="All">All Categories</option>
                <option value="Tractors">Tractors</option>
                <option value="Irrigation">Irrigation</option>
                <option value="Seeders">Seeders</option>
                <option value="Harvesters">Harvesters</option>
              </select>
            </div>

            {/* Rent/Buy Select */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-900 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="All">All Types</option>
              <option value="rent">Available for Rent</option>
              <option value="buy">Available to Buy</option>
            </select>
          </div>
        </section>

        {/* Listings Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.length === 0 ? (
            <div className="col-span-full glass p-20 rounded-xl text-center border border-border/40">
              <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No Equipment Found</h3>
              <p className="text-sm text-muted-foreground">Adjust your filters or type a different query.</p>
            </div>
          ) : (
            filteredListings.map((item) => (
              <div 
                key={item.id} 
                className="glass rounded-xl border border-border/40 overflow-hidden hover:translate-y-[-2px] transition-all flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  {/* Category Header */}
                  <div className="flex justify-between items-center">
                    <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      item.type === "rent" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      {item.type === "rent" ? "For Rent" : "For Sale"}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start space-x-4">
                    <div className="h-14 w-14 rounded-lg bg-slate-900 border border-border/40 flex items-center justify-center text-3xl shrink-0">
                      {item.image}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug hover:text-primary transition-colors cursor-pointer">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">Provider: {item.provider}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {item.specs}
                  </p>

                  {/* Location & Rating */}
                  <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/20 pt-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>{item.region}</span>
                    </div>

                    <div className="flex items-center space-x-1 text-secondary">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="font-bold text-white">{item.rating}</span>
                      <span>({item.reviews})</span>
                    </div>
                  </div>
                </div>

                {/* Footer Pricing & Button */}
                <div className="bg-slate-900/60 border-t border-border/40 px-6 py-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Price</span>
                    <span className="text-white font-extrabold text-lg">
                      ${item.price}
                      <span className="text-xs font-normal text-muted-foreground">/{item.unit}</span>
                    </span>
                  </div>

                  {item.available ? (
                    <button 
                      onClick={() => handleOpenBooking(item)}
                      className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow"
                    >
                      {item.type === "rent" ? "Book Rental" : "Inquire Buy"}
                    </button>
                  ) : (
                    <span className="text-xs bg-slate-950 border border-border px-3 py-2 rounded-lg text-muted-foreground font-semibold">
                      Out of Stock
                    </span>
                  )}
                </div>

              </div>
            ))
          )}
        </section>

      </main>

      {/* Booking Simulator Modal */}
      {bookingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-md rounded-xl border border-border/40 p-6 space-y-6 relative">
            <button 
              onClick={() => setBookingItem(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {!bookingConfirmed ? (
              <>
                <div className="flex items-center space-x-3 pb-3 border-b border-border/20">
                  <span className="text-2xl">{bookingItem.image}</span>
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{bookingItem.name}</h3>
                    <span className="text-[10px] text-muted-foreground">Deal provided by {bookingItem.provider}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {bookingItem.type === "rent" ? (
                    <div>
                      <div className="flex justify-between text-xs font-semibold uppercase text-muted-foreground mb-2">
                        <span>Rental Duration</span>
                        <span className="text-primary font-bold">{bookingDays} days</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={bookingDays}
                        onChange={(e) => setBookingDays(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                        <span>1 day</span>
                        <span>15 days</span>
                        <span>30 days</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center space-x-2 text-xs text-emerald-400">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>Ready for dispatch! Includes manufacturer warranty & support.</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">
                      Delivery / Pickup Address
                    </label>
                    <input
                      type="text"
                      value={bookingAddress}
                      onChange={(e) => setBookingAddress(e.target.value)}
                      placeholder="e.g. Plot 15, Nakuru Highway Farm"
                      className="w-full bg-slate-900 border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Costs breakdown */}
                <div className="bg-slate-900/60 border border-border/40 rounded-lg p-4 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {bookingItem.type === "rent" ? `Rental ($${bookingItem.price} x ${bookingDays} days):` : `Purchase Cost:`}
                    </span>
                    <span className="text-white font-bold">
                      ${bookingItem.type === "rent" ? bookingItem.price * bookingDays : bookingItem.price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Insurance & Safety Escrow:</span>
                    <span className="text-white font-bold">$15.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Local Transport/Delivery:</span>
                    <span className="text-white font-bold">Free (Promo)</span>
                  </div>
                  <div className="border-t border-border/20 pt-3 flex justify-between items-center text-sm font-semibold">
                    <span className="text-white">Total Estimated Payout:</span>
                    <span className="text-secondary font-black">
                      ${bookingItem.type === "rent" ? (bookingItem.price * bookingDays) + 15 : bookingItem.price + 15}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmBooking}
                  disabled={loadingBooking || !bookingAddress}
                  className="w-full bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-primary-foreground font-semibold py-3 rounded-lg text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {loadingBooking ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  ) : (
                    <span>{bookingItem.type === "rent" ? "Confirm Rental Booking" : "Send Purchase Inquiry"}</span>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {bookingItem.type === "rent" ? "Rental Booked Successfully!" : "Inquiry Sent Successfully!"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
                    The machine provider <strong>{bookingItem.provider}</strong> has been notified. They will contact you shortly at your registered details.
                  </p>
                </div>
                
                <div className="pt-2 text-xs text-muted-foreground flex justify-center items-center space-x-1.5">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Scheduled delivery to: <strong>{bookingAddress}</strong></span>
                </div>

                <button
                  onClick={() => setBookingItem(null)}
                  className="w-full bg-slate-900 border border-border hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg text-xs transition-all mt-4"
                >
                  Close Panel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
