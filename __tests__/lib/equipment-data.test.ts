import {
  EQUIPMENT_LISTINGS,
  filterEquipment,
  EquipmentItem,
} from "@/lib/data/equipment"

describe("Equipment Data & Filter Utility", () => {
  test("contains valid default equipment listings", () => {
    expect(EQUIPMENT_LISTINGS.length).toBeGreaterThan(0)
    expect(EQUIPMENT_LISTINGS[0]).toHaveProperty("name")
    expect(EQUIPMENT_LISTINGS[0]).toHaveProperty("category")
  })

  test("filters equipment by search query", () => {
    const results = filterEquipment(EQUIPMENT_LISTINGS, "Tractor", "All", "All")
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((item) => item.name.includes("Tractor") || item.specs.includes("Tractor"))).toBe(true)
  })

  test("filters equipment by category and type", () => {
    const results = filterEquipment(EQUIPMENT_LISTINGS, "", "Irrigation", "buy")
    expect(results.length).toBe(1)
    expect(results[0].name).toBe("Solar-Powered Drip Irrigation Kit")
  })
})
