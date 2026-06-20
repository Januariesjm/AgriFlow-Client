"use client"

import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { useState, useEffect } from "react"
import { 
  Sprout, 
  TrendingUp, 
  Truck, 
  BrainCircuit, 
  ShieldCheck, 
  Warehouse, 
  ShoppingBag,
  MapPin,
  Scale
} from "lucide-react"

export default function Home() {
  const priceTicker = [
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

  const features = [
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

  const placeholders = [
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
    }
  ]

  const [currentPage, setCurrentPage] = useState(0)
  const [dbProducts, setDbProducts] = useState<any[]>([])
  
  const totalPages = Math.ceil(priceTicker.length / 4)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages)
    }, 10000) // 10 seconds
    return () => clearInterval(timer)
  }, [totalPages])

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/products?limit=5")
        if (res.ok) {
          const data = await res.json()
          setDbProducts(data.products || [])
        }
      } catch (err) {
        console.error("Error fetching latest products on home page:", err)
      }
    }
    fetchLatestProducts()
  }, [])

  // Combine real database products with premium placeholders to ensure exactly 5 are shown
  const combinedProducts = [...dbProducts, ...placeholders].slice(0, 5)

  // Get high quality product crop image
  const getProductImage = (p: any) => {
    if (p.isPlaceholder && p.image) {
      return p.image
    }
    if (p.images && p.images.length > 0 && p.images[0]) {
      return p.images[0]
    }
    const nameLower = (p.name || "").toLowerCase()
    if (nameLower.includes("maize") || nameLower.includes("corn")) {
      return "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600"
    }
    if (nameLower.includes("bean")) {
      return "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=600"
    }
    if (nameLower.includes("rice")) {
      return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600"
    }
    if (nameLower.includes("onion")) {
      return "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=600"
    }
    if (nameLower.includes("potato")) {
      return "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600"
    }
    if (nameLower.includes("tomato")) {
      return "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600"
    }
    const cat = (p.category || "").toLowerCase()
    if (cat === "grains") {
      return "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600"
    }
    if (cat === "vegetables") {
      return "https://images.unsplash.com/photo-1566385278603-605b5cfd6580?auto=format&fit=crop&q=80&w=600"
    }
    if (cat === "fruits") {
      return "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=600"
    }
    return "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=600"
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-animate text-foreground bg-gradient-animate">
      <Header />

      {/* Price Ticker Bar */}
      <div className="bg-primary/10 border-b border-primary/20 py-3 overflow-hidden w-full relative group">
        <div 
          className="flex transition-transform duration-700 ease-in-out w-full"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {Array.from({ length: totalPages }).map((_, pageIdx) => {
            const pageItems = priceTicker.slice(pageIdx * 4, (pageIdx + 1) * 4)
            return (
              <div key={pageIdx} className="w-full shrink-0 flex flex-wrap md:flex-nowrap justify-center items-center gap-4 px-4">
                {pageItems.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-primary/10 text-xs font-semibold max-w-[280px] md:max-w-xs truncate shadow-sm hover:border-primary/30 transition-colors">
                    <span className="text-primary font-bold shrink-0">{item.crop}</span>
                    <span className="text-muted-foreground truncate" title={item.location}>{item.location}</span>
                    <span className="text-secondary shrink-0 font-bold">{item.price}</span>
                    <span className={item.trend === "up" ? "text-green-400 shrink-0" : "text-red-400 shrink-0"}>
                      {item.trend === "up" ? "▲" : "▼"}
                    </span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
        
        {/* Pagination Dots */}
        <div className="flex justify-center space-x-1.5 mt-2">
          {Array.from({ length: totalPages }).map((_, pageIdx) => (
            <button
              key={pageIdx}
              onClick={() => setCurrentPage(pageIdx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentPage === pageIdx ? "w-6 bg-primary" : "w-1.5 bg-primary/30 hover:bg-primary/50"
              }`}
              title={`Page ${pageIdx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 pt-10 pb-6 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-secondary/15 border border-secondary/35 px-3.5 py-1.5 rounded-full mb-8 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-secondary animate-pulse" />
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Agricultural Supply Chain Network
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
          Agricultural Supply Chain Network. <br />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent font-semibold block mt-2 text-xl sm:text-2xl">
            Connecting farmers, buyers, and transporters.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          AgriFlow merges market pricing, logistics intelligence, crop demand forecasts, and regional commerce to maximize profits for farmers and buyers.
        </p>
      </section>

      {/* Top Harvest Offers Section */}
      <section className="pt-6 pb-12 border-t border-border/40 bg-slate-950/20 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Top Harvest Offers</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Direct pricing from verified farmers across the region
              </p>
            </div>
            <Link 
              href="/products" 
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center space-x-1 bg-primary/5 px-2.5 py-1.5 rounded-full border border-primary/20 hover:border-primary/40 cursor-pointer"
            >
              <span>View All Products</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {combinedProducts.map((p, idx) => {
              const visibilityClass = idx >= 2 ? "hidden lg:flex" : "flex"
              return (
                <div 
                  key={p.id} 
                  className={`${visibilityClass} glass rounded-xl overflow-hidden hover:translate-y-[-4px] hover:border-primary/40 transition-all duration-300 flex flex-col justify-between border border-white/5 p-3`}
                >
                  <div className="flex flex-col flex-1">
                    {/* High Quality Product Image */}
                    <div className="relative w-full aspect-video overflow-hidden rounded-lg mb-3 bg-slate-900 border border-white/5">
                      <img 
                        src={getProductImage(p)} 
                        alt={p.name} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {p.category}
                      </span>
                    </div>

                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xs font-bold text-white line-clamp-1 hover:text-primary transition-colors flex-1 mr-2">
                        {p.isPlaceholder ? (
                          p.name
                        ) : (
                          <Link href={`/products/${p.id}`}>{p.name}</Link>
                        )}
                      </h3>
                      <span className="text-secondary font-black text-xs shrink-0">
                        ${p.price}/kg
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed flex-1">
                      {p.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-auto pt-3 border-t border-white/5">
                    <div className="space-y-1.5 text-[10px] text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span className="truncate">{p.region}, {p.country}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Scale className="h-3 w-3 text-primary shrink-0" />
                        <span>{p.quantity.toLocaleString()} kg available</span>
                      </div>
                    </div>

                    {p.isPlaceholder ? (
                      <Link
                        href="/products"
                        className="w-full bg-slate-900/80 hover:bg-slate-800 text-white text-center block text-[11px] font-semibold py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                      >
                        Market Offer
                      </Link>
                    ) : (
                      <Link
                        href={`/products/${p.id}`}
                        className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-center block text-[11px] font-semibold py-2 rounded-lg transition-all cursor-pointer"
                      >
                        View Offer
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-t border-border/40 bg-slate-950/40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
              Intelligence Modules Built for Scale
            </h2>
            <p className="text-muted-foreground">
              A comprehensive system connecting all nodes of the agricultural value chain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="glass p-8 rounded-xl hover:translate-y-[-4px] transition-all duration-300">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
