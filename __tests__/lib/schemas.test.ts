import {
  ProfileSchema,
  WalletBalanceSchema,
  ProductSchema,
  WarehouseSchema,
  FacilitySchema,
  AdminStatsSchema,
  TransportCostEstimateSchema,
  CreateOrderInputSchema,
  OrderResponseSchema,
  FacilityFormSchema,
  ProductFormSchema,
  WarehouseFormSchema,
  formatZodIssues,
} from "@/lib/schemas"

describe("Zod Schemas", () => {
  describe("OrderResponseSchema", () => {
    const validOrder = {
      id: "ord-101",
      product_id: "prod-1",
      buyer_id: "buyer-2",
      quantity: 50,
      total_price: 11000,
      status: "paid" as const,
      created_at: "2026-08-01T10:00:00Z",
    }

    test("accepts a valid order payload", () => {
      const result = OrderResponseSchema.safeParse(validOrder)
      expect(result.success).toBe(true)
    })

    test("rejects an order payload with invalid status", () => {
      const result = OrderResponseSchema.safeParse({ ...validOrder, status: "shipped_out" })
      expect(result.success).toBe(false)
    })

    test("rejects an order payload with non-numeric total_price", () => {
      const result = OrderResponseSchema.safeParse({ ...validOrder, total_price: "11000" })
      expect(result.success).toBe(false)
    })
  })
  describe("ProfileSchema", () => {
    const validProfile = {
      id: "user-123",
      email: "farmer@agriflow.com",
      full_name: "John Mwangi",
      role: "farmer" as const,
      country: "Kenya",
      is_verified: true,
      created_at: "2026-01-15T10:00:00Z",
    }

    test("accepts a valid profile payload", () => {
      const result = ProfileSchema.safeParse(validProfile)
      expect(result.success).toBe(true)
    })

    test("rejects a profile with invalid email", () => {
      const result = ProfileSchema.safeParse({ ...validProfile, email: "not-an-email" })
      expect(result.success).toBe(false)
    })

    test("rejects a profile with invalid role", () => {
      const result = ProfileSchema.safeParse({ ...validProfile, role: "superadmin" })
      expect(result.success).toBe(false)
    })

    test("accepts optional fields when missing", () => {
      const result = ProfileSchema.safeParse(validProfile)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.phone).toBeUndefined()
        expect(result.data.region).toBeUndefined()
      }
    })
  })

  describe("WalletBalanceSchema", () => {
    const validWallet = {
      available_balance: 50000,
      locked_balance: 12000,
      deposits: [
        { id: "dep-1", amount: 25000, method: "mobile_money", reference: "MPESA-123", status: "completed" as const, created_at: "2026-08-01T10:00:00Z" },
      ],
      withdrawals: [],
    }

    test("accepts a valid wallet payload", () => {
      const result = WalletBalanceSchema.safeParse(validWallet)
      expect(result.success).toBe(true)
    })

    test("rejects wallet with missing balance fields", () => {
      const result = WalletBalanceSchema.safeParse({ deposits: [], withdrawals: [] })
      expect(result.success).toBe(false)
    })

    test("rejects deposit with invalid status", () => {
      const invalid = {
        ...validWallet,
        deposits: [{ ...validWallet.deposits[0], status: "unknown" }],
      }
      const result = WalletBalanceSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe("ProductSchema", () => {
    const validProduct = {
      id: "prod-1",
      farmer_id: "farmer-1",
      name: "Organic Yellow Maize",
      category: "Grains",
      quantity: 500,
      unit: "kg",
      price: 220,
      currency: "KES",
      country: "Kenya",
      region: "Central",
      gps_lat: -1.286,
      gps_lng: 36.817,
      quality_grade: "A" as const,
      status: "active" as const,
      created_at: "2026-08-01T10:00:00Z",
    }

    test("accepts a valid product payload", () => {
      const result = ProductSchema.safeParse(validProduct)
      expect(result.success).toBe(true)
    })

    test("rejects product with empty name", () => {
      const result = ProductSchema.safeParse({ ...validProduct, name: "" })
      expect(result.success).toBe(false)
    })

    test("rejects product with invalid quality grade", () => {
      const result = ProductSchema.safeParse({ ...validProduct, quality_grade: "S" })
      expect(result.success).toBe(false)
    })

    test("rejects product with invalid status", () => {
      const result = ProductSchema.safeParse({ ...validProduct, status: "archived" })
      expect(result.success).toBe(false)
    })
  })

  describe("WarehouseSchema", () => {
    test("rejects warehouse with empty name", () => {
      const result = WarehouseSchema.safeParse({
        id: "wh-1", name: "", location: "Nairobi", capacity: 500,
        storageType: "Cold", gpsLat: -1.3, gpsLng: 36.8, status: "active", createdAt: "2026-01-01",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("FacilitySchema", () => {
    test("rejects facility with invalid status", () => {
      const result = FacilitySchema.safeParse({
        id: "f1", name: "Hub", type: "Cold", capacity: 100, occupied: 0,
        dailyRate: 0.5, address: "Addr", gpsLat: "0", gpsLng: "0", status: "closed",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("TransportCostEstimateSchema", () => {
    test("accepts valid transport cost estimate", () => {
      const result = TransportCostEstimateSchema.safeParse({ estimated_cost: 1500, distance_km: 120 })
      expect(result.success).toBe(true)
    })
  })

  describe("CreateOrderInputSchema", () => {
    test("rejects order with missing product_id", () => {
      const result = CreateOrderInputSchema.safeParse({
        product_id: "", quantity: 5, delivery_lat: -1.2, delivery_lng: 36.8, delivery_address: "Nairobi",
      })
      expect(result.success).toBe(false)
    })

    test("rejects order with quantity below 1", () => {
      const result = CreateOrderInputSchema.safeParse({
        product_id: "p-1", quantity: 0, delivery_lat: -1.2, delivery_lng: 36.8, delivery_address: "Nairobi",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("AdminStatsSchema", () => {
    test("applies defaults for missing nested fields", () => {
      const result = AdminStatsSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe("FacilityFormSchema", () => {
    const validForm = {
      name: "Eldoret Grain Terminal",
      type: "Grain Silo",
      capacity: "500",
      dailyRate: "0.50",
      address: "Silo Road, Eldoret",
      gpsLat: "-0.5143",
      gpsLng: "35.2698",
      status: "active",
    }

    test("accepts valid raw form input and coerces numeric strings", () => {
      const result = FacilityFormSchema.safeParse(validForm)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.capacity).toBe(500)
        expect(result.data.dailyRate).toBe(0.5)
        expect(result.data.gpsLat).toBeCloseTo(-0.5143)
      }
    })

    test("rejects empty facility name", () => {
      const result = FacilityFormSchema.safeParse({ ...validForm, name: "  " })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(formatZodIssues(result.error)).toContain("Facility name is required.")
      }
    })

    test("rejects non-numeric capacity", () => {
      const result = FacilityFormSchema.safeParse({ ...validForm, capacity: "lots" })
      expect(result.success).toBe(false)
    })

    test("rejects zero or negative daily rate", () => {
      expect(FacilityFormSchema.safeParse({ ...validForm, dailyRate: "0" }).success).toBe(false)
      expect(FacilityFormSchema.safeParse({ ...validForm, dailyRate: "-2" }).success).toBe(false)
    })

    test("rejects out-of-range GPS coordinates", () => {
      expect(FacilityFormSchema.safeParse({ ...validForm, gpsLat: "120" }).success).toBe(false)
      expect(FacilityFormSchema.safeParse({ ...validForm, gpsLng: "-181" }).success).toBe(false)
    })
  })

  describe("ProductFormSchema", () => {
    const validForm = {
      name: "Maize",
      category: "Grains",
      description: "Dried grade-A maize",
      quantity: "10",
      unit: "ton",
      price: "220",
      gpsLat: "-1.2921",
      gpsLng: "36.8219",
      harvestDate: "2026-09-01",
      qualityGrade: "A",
      farmId: "farm-1",
    }

    test("accepts valid raw form input and coerces numeric strings", () => {
      const result = ProductFormSchema.safeParse(validForm)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.quantity).toBe(10)
        expect(result.data.price).toBe(220)
      }
    })

    test("rejects empty quantity (coerced to zero)", () => {
      const result = ProductFormSchema.safeParse({ ...validForm, quantity: "" })
      expect(result.success).toBe(false)
    })

    test("rejects non-numeric price", () => {
      const result = ProductFormSchema.safeParse({ ...validForm, price: "expensive" })
      expect(result.success).toBe(false)
    })

    test("rejects unknown quality grade", () => {
      const result = ProductFormSchema.safeParse({ ...validForm, qualityGrade: "S" })
      expect(result.success).toBe(false)
    })

    test("allows optional description, harvest date, and farm id to be omitted", () => {
      const { description: _d, harvestDate: _h, farmId: _f, ...rest } = validForm
      const result = ProductFormSchema.safeParse(rest)
      expect(result.success).toBe(true)
    })
  })

  describe("WarehouseFormSchema", () => {
    const validForm = {
      name: "Nairobi Central Depot",
      location: "Nairobi Industrial Area",
      capacity: "500",
      storageType: "Cold Storage",
      gpsLat: "-1.3005",
      gpsLng: "36.8822",
      status: "active",
    }

    test("accepts valid raw form input", () => {
      expect(WarehouseFormSchema.safeParse(validForm).success).toBe(true)
    })

    test("rejects empty location", () => {
      const result = WarehouseFormSchema.safeParse({ ...validForm, location: "" })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(formatZodIssues(result.error)).toContain("Warehouse location is required.")
      }
    })

    test("rejects invalid status", () => {
      expect(WarehouseFormSchema.safeParse({ ...validForm, status: "closed" }).success).toBe(false)
    })
  })

  describe("formatZodIssues", () => {
    test("joins all issue messages into one string", () => {
      const result = FacilityFormSchema.safeParse({
        name: "",
        type: "Cold Storage",
        capacity: "0",
        dailyRate: "0.5",
        address: "",
        gpsLat: "0",
        gpsLng: "0",
        status: "active",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const message = formatZodIssues(result.error)
        expect(message).toContain("Facility name is required.")
        expect(message).toContain("Capacity must be a positive number of tons.")
        expect(message).toContain("Facility address is required.")
      }
    })
  })
})
