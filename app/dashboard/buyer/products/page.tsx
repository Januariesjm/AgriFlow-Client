"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Product } from "@/lib/types"
import { Search, MapPin, Scale } from "lucide-react"

export default function BuyerProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const endpoint = search ? `products?search=${encodeURIComponent(search)}` : "products"
      const data = await api.get<{ products: Product[] }>(endpoint)
      if (data?.products) {
        setProducts(data.products)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Marketplace Listings</h1>
        <p className="text-muted-foreground mt-1">
          Search and purchase active harvest offers.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crop offers (e.g. Maize, Beans)..."
            className="w-full bg-slate-900 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm transition-all cursor-pointer"
        >
          Search
        </button>
      </form>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">No crop offers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="glass p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-2 py-0.5 rounded-full uppercase">
                    {p.category}
                  </span>
                  <span className="text-secondary font-bold text-lg">${p.price}/{p.unit}</span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{p.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                  {p.description || "No description provided."}
                </p>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-3 border-t border-border/40">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{p.region}, {p.country}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Scale className="h-3.5 w-3.5 text-primary" />
                    <span>Stock: {p.quantity} {p.unit}s</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href={`/products/${p.id}`}
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-center block text-sm font-semibold py-2 rounded-lg transition-all"
                >
                  View Details & Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
