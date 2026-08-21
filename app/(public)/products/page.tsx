"use client"
import { logger } from "@/lib/logger"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { api } from "@/lib/api"
import { Product } from "@/lib/types"
import { Sprout, MapPin, Scale, Calendar, Search, Filter } from "lucide-react"

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [country, setCountry] = useState("")
  const [category, setCategory] = useState("")
  const [sort, setSort] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (country) params.append("country", country)
      if (category) params.append("category", category)
      if (sort) params.append("sort", sort)
      if (minPrice) params.append("min_price", minPrice)
      if (maxPrice) params.append("max_price", maxPrice)

      const data = await api.get<{ products: Product[] }>(`products?${params.toString()}`)
      if (data?.products) {
        setProducts(data.products)
      }
    } catch (err) {
      logger.error("Products", "Error fetching products:", err)
    } finally {
      setLoading(false)
    }
  }, [search, country, category, sort, minPrice, maxPrice])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts()
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-foreground">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Agricultural Harvest Marketplace
          </h1>
          <p className="text-muted-foreground">
            Buy directly from farmers, search for the cheapest high quality produce directly from farmers for your business.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="glass p-6 rounded-xl mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 w-full flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search crop offers (e.g. Maize, Beans)..."
                className="w-full bg-slate-900 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="w-full lg:w-auto flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Filters:</span>
            </div>

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-slate-900 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">All Countries</option>
              <option value="Kenya">Kenya</option>
              <option value="Uganda">Uganda</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Rwanda">Rwanda</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-900 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">All Categories</option>
              <option value="Grains">Grains</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Legumes">Legumes</option>
              <option value="Tubers">Tubers</option>
              <option value="Fruits">Fruits</option>
              <option value="Livestock">Livestock Farming</option>
              <option value="Poultry">Poultry</option>
              <option value="Dairy">Dairy</option>
              <option value="Aquaculture">Aquaculture</option>
              <option value="Agrochemicals">Agrochemicals</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-slate-900 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">Sort: Newest</option>
              <option value="price_asc">Price: Low to High (Cheapest)</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={fetchProducts}
                onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
                placeholder="Min ($)"
                className="w-16 bg-slate-900 border border-border rounded-lg px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground/50"
              />
              <span className="text-muted-foreground text-xs">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={fetchProducts}
                onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
                placeholder="Max ($)"
                className="w-16 bg-slate-900 border border-border rounded-lg px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Loading marketplace listings...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 glass rounded-xl">
            <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">No Offers Found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filter selection or search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <div key={p.id} className="glass rounded-xl overflow-hidden hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-2.5 py-1 rounded-full uppercase">
                      {p.category}
                    </span>
                    <span className="text-secondary font-bold text-lg">
                      ${p.price}/{p.unit}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 hover:text-primary transition-colors">
                    <Link href={`/products/${p.id}`}>{p.name}</Link>
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {p.description || "No description provided."}
                  </p>

                  <div className="space-y-2 text-xs text-muted-foreground border-t border-border/40 pt-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>{p.region}, {p.country}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Scale className="h-3.5 w-3.5 text-primary" />
                      <span>Quantity: {p.quantity} {p.unit}s available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>Harvest: {p.harvest_date || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 border-t border-border/40 px-6 py-4">
                  <Link
                    href={`/products/${p.id}`}
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-center block text-sm font-semibold py-2 rounded-lg transition-all"
                  >
                    View Offer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
