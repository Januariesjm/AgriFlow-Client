"use client"
import { logger } from "@/lib/logger"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "@/lib/hooks/useSession"
import { useResourceWithFallback } from "@/lib/hooks/useResourceWithFallback"
import { clientApiGet } from "@/lib/api-client"
import { ProductFormSchema, formatZodIssues } from "@/lib/schemas"
import { Product, Farm } from "@/lib/types"
import { Plus, Trash2, Sprout, ShoppingBag } from "lucide-react"

const listMyProducts = () =>
  clientApiGet<{ products: Product[] }>("products/my").then((data) => data?.products ?? [])

export default function MyProducts() {
  const { session } = useSession()
  const {
    items: products,
    loading,
    error,
    setError,
    addResource,
    deleteResource,
  } = useResourceWithFallback<Product>("products", "af_farmer_products", [], undefined, {
    listItems: listMyProducts,
  })

  const [farms, setFarms] = useState<Farm[]>([])

  // Form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [name, setName] = useState("Maize")
  const [category, setCategory] = useState("Grains")
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unit, setUnit] = useState("ton")
  const [price, setPrice] = useState("")
  const [gpsLat, setGpsLat] = useState("-1.2921")
  const [gpsLng, setGpsLng] = useState("36.8219")
  const [harvestDate, setHarvestDate] = useState("")
  const [qualityGrade, setQualityGrade] = useState("Ungraded")
  const [farmId, setFarmId] = useState("")

  const fetchFarms = useCallback(async () => {
    try {
      const data = await clientApiGet<{ farms: Farm[] }>("farms")
      if (data?.farms) {
        setFarms(data.farms)
        if (data.farms.length > 0) {
          setFarmId(data.farms[0].id)
          setGpsLat(data.farms[0].gps_lat.toString())
          setGpsLng(data.farms[0].gps_lng.toString())
        }
      }
    } catch (err) {
      logger.error("DashboardFarmerProducts", "Failed to load farms", err)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchFarms()
    }
  }, [session, fetchFarms])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const parsed = ProductFormSchema.safeParse({
      name,
      category,
      description,
      quantity,
      unit,
      price,
      gpsLat,
      gpsLng,
      harvestDate,
      qualityGrade,
      farmId,
    })
    if (!parsed.success) {
      setError(formatZodIssues(parsed.error))
      return
    }

    try {
      const selectedFarm = farms.find((f) => f.id === parsed.data.farmId)
      const country = selectedFarm?.country || "Kenya"
      const region = selectedFarm?.region || "Nakuru"

      await addResource(
        {
          name: parsed.data.name,
          category: parsed.data.category,
          description: parsed.data.description,
          quantity: parsed.data.quantity,
          unit: parsed.data.unit,
          price: parsed.data.price,
          country,
          region,
          gps_lat: parsed.data.gpsLat,
          gps_lng: parsed.data.gpsLng,
          harvest_date: parsed.data.harvestDate || undefined,
          quality_grade: parsed.data.qualityGrade,
          farm_id: parsed.data.farmId || undefined,
        },
        "prod"
      )

      setShowAddForm(false)
      setDescription("")
      setQuantity("")
      setPrice("")
    } catch (err: unknown) {
      logger.error("DashboardFarmerProducts", "Failed to create crop listing", err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this crop listing?")) return
    await deleteResource(id)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Harvest Listings</h1>
          <p className="text-muted-foreground mt-1">
            Publish your crop listings to the regional marketplace.
          </p>
        </div>

        <button
          onClick={() => {
            if (farms.length === 0) {
              alert("Please configure a farm profile first under 'My Farm'")
              return
            }
            setShowAddForm(!showAddForm)
          }}
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{showAddForm ? "Cancel" : "Add Crop Offer"}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="glass p-8 rounded-xl">
          <div className="flex items-center space-x-2 mb-6">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold text-white">List Future or Existing Harvest</h3>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Crop Name</label>
                <select
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
                >
                  <option value="Maize">Maize</option>
                  <option value="Beans">Beans</option>
                  <option value="Rice">Rice</option>
                  <option value="Tomatoes">Tomatoes</option>
                  <option value="Onions">Onions</option>
                  <option value="Potatoes">Potatoes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
                >
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
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Quality Grade</label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
                >
                  <option value="A">Grade A (Premium)</option>
                  <option value="B">Grade B (Standard)</option>
                  <option value="C">Grade C (Sub-standard)</option>
                  <option value="Ungraded">Ungraded / Raw</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Quantity</label>
                <input
                  type="number"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Listing Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
                >
                  <option value="ton">Tons</option>
                  <option value="kg">Kilograms</option>
                  <option value="bag">Bags</option>
                  <option value="crate">Crates</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Price ($ USD)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                  placeholder="220"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Harvest Date</label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Origin Farm</label>
                <select
                  value={farmId}
                  onChange={(e) => {
                    setFarmId(e.target.value)
                    const selected = farms.find((f) => f.id === e.target.value)
                    if (selected) {
                      setGpsLat(selected.gps_lat.toString())
                      setGpsLng(selected.gps_lng.toString())
                    }
                  }}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                placeholder="Include detail about pesticide treatments, moisture content, etc."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow disabled:opacity-50"
            >
              {loading ? "Publishing Listing..." : "Publish to Marketplace"}
            </button>
          </form>
        </div>
      )}

      {/* Listings list */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Active Crop Offers</h3>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <Sprout className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active listings published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-slate-900/60 p-6 rounded-lg border border-border/40 flex justify-between items-start gap-4">
                <div className="space-y-1.5">
                  <span className="bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-2 py-0.5 rounded-full uppercase">
                    {p.quality_grade} | {p.category}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">{p.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Price: <span className="text-secondary font-semibold">${p.price}/{p.unit}</span> | Qty: {p.quantity} {p.unit}s
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Harvest: {p.harvest_date || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive transition-colors cursor-pointer"
                  title="Remove Listing"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
