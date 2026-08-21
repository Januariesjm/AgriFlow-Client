"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Package, Plus, Trash2, CheckCircle, ShoppingBag, Edit, RefreshCw } from "lucide-react"

interface Product {
  id: string
  name: string
  category: string
  description: string
  price: number
  quantity: number
  unit: string
  createdAt: string
}

import { useSession } from "@/lib/hooks/useSession"

interface Product {
  id: string
  name: string
  category: string
  description: string
  price: number
  quantity: number
  unit: string
  createdAt: string
}

export default function VendorProducts() {
  const { session } = useSession()
  const [products, setProducts] = useState<Product[]>([])

  // Form states
  const [name, setName] = useState("")
  const [category, setCategory] = useState("Seeds")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unit, setUnit] = useState("50kg Bag")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (session?.user) {
      const stored = localStorage.getItem(`af_vendor_products_${session.user.id}`)
      if (stored) {
        setProducts(JSON.parse(stored))
      } else {
        const defaultProducts: Product[] = [
          { id: "p1", name: "Hybrid Maize Seeds (Pan 53)", category: "Seeds", description: "High yielding, drought tolerant hybrid maize variety.", price: 12.5, quantity: 45, unit: "2kg Pack", createdAt: new Date().toISOString() },
          { id: "p2", name: "NPK 15:15:15 Fertilizer", category: "Fertilizers", description: "Balanced nutrient fertilizer for planting and top dressing.", price: 34.0, quantity: 8, unit: "50kg Bag", createdAt: new Date().toISOString() },
          { id: "p3", name: "Glyphosate Weedkiller 1L", category: "Agro-Chemicals", description: "Non-selective systemic herbicide for weeds control.", price: 8.9, quantity: 15, unit: "1L Bottle", createdAt: new Date().toISOString() },
          { id: "p4", name: "Premium Hand Hoe (Jembe)", category: "Farm Tools", description: "Forged carbon steel hoe head with durable wooden handle.", price: 6.5, quantity: 3, unit: "Piece", createdAt: new Date().toISOString() }
        ]
        setProducts(defaultProducts)
        localStorage.setItem(`af_vendor_products_${session.user.id}`, JSON.stringify(defaultProducts))
      }
    }
  }, [session])

  const saveProducts = (list: Product[]) => {
    setProducts(list)
    if (session?.user) {
      localStorage.setItem(`af_vendor_products_${session.user.id}`, JSON.stringify(list))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!name.trim()) {
        throw new Error("Product name is required.")
      }

      const priceVal = Number(price)
      if (isNaN(priceVal) || priceVal <= 0) {
        throw new Error("Please enter a valid price.")
      }

      const qtyVal = Number(quantity)
      if (isNaN(qtyVal) || qtyVal < 0) {
        throw new Error("Please enter a valid stock quantity.")
      }

      const newProduct: Product = {
        id: `inp-${Date.now()}`,
        name,
        category,
        description,
        price: priceVal,
        quantity: qtyVal,
        unit,
        createdAt: new Date().toISOString()
      }

      const updated = [newProduct, ...products]
      saveProducts(updated)

      // Reset Form
      setName("")
      setDescription("")
      setPrice("")
      setQuantity("")
      setSuccess("Agricultural input item listed successfully!")
      setTimeout(() => setSuccess(""), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this input product from your catalog?")) return
    const updated = products.filter((p) => p.id !== id)
    saveProducts(updated)
    setSuccess("Product removed from catalog.")
    setTimeout(() => setSuccess(""), 4000)
  }

  const adjustStock = (id: string, current: number) => {
    const input = prompt("Enter new stock level:", current.toString())
    if (input === null) return
    const num = Number(input)
    if (isNaN(num) || num < 0) {
      alert("Invalid stock level.")
      return
    }

    const updated = products.map((p) => p.id === id ? { ...p, quantity: num } : p)
    saveProducts(updated)
    setSuccess("Stock level updated successfully.")
    setTimeout(() => setSuccess(""), 4000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <span>Input Inventory & Catalog</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          List hybrid seeds, fertilizers, chemicals, sprayers, and feeds for local farmer sourcing.
        </p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List Input Item Form */}
        <div className="glass p-8 rounded-xl lg:col-span-1 h-fit">
          <div className="flex items-center space-x-2.5 mb-6">
            <Plus className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold text-white font-sans">List Agro-Input</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Input Item Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Copper Fungicide DF"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none"
                >
                  <option value="Seeds">Seeds</option>
                  <option value="Fertilizers">Fertilizers</option>
                  <option value="Agro-Chemicals">Agro-Chemicals</option>
                  <option value="Farm Tools">Farm Tools</option>
                  <option value="Animal Feed">Animal Feed</option>
                  <option value="Irrigation">Irrigation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Packaging Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none"
                >
                  <option value="2kg Pack">2kg Pack</option>
                  <option value="10kg Bag">10kg Bag</option>
                  <option value="50kg Bag">50kg Bag</option>
                  <option value="1L Bottle">1L Bottle</option>
                  <option value="5L Can">5L Can</option>
                  <option value="Piece">Piece</option>
                  <option value="Pack">Pack</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="24.50"
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="100"
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Product Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Usage details, dosage directions, expiry date..."
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3 rounded-lg text-sm transition-all cursor-pointer shadow disabled:opacity-50"
            >
              List in Shop
            </button>
          </form>
        </div>

        {/* Inventory Table List */}
        <div className="glass p-8 rounded-xl lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Inventory Listing Directory
          </h3>

          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Your catalog is currently empty.</p>
          ) : (
            <div className="space-y-4">
              {products.map((p) => (
                <div key={p.id} className="bg-slate-900/60 p-5 rounded-lg border border-border/40 flex justify-between items-start gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-bold text-white">{p.name}</span>
                        <span className="bg-slate-950 border border-border text-[9px] text-muted-foreground font-semibold px-2 py-0.5 rounded-full uppercase">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{p.description || "No description provided."}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Price</span>
                        <span className="text-white font-bold text-sm">${p.price.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Stock level</span>
                        <span className={`font-bold ${p.quantity < 10 ? "text-red-400" : "text-white"}`}>
                          {p.quantity} units ({p.unit})
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Listed Date</span>
                        <span className="text-muted-foreground text-[11px]">
                          {new Date(p.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => adjustStock(p.id, p.quantity)}
                      className="p-2 rounded-lg bg-slate-800 text-muted-foreground hover:text-white hover:bg-slate-700/60 transition-colors"
                      title="Adjust Stock"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 rounded-lg bg-slate-800 text-muted-foreground hover:text-destructive hover:bg-slate-700/60 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
