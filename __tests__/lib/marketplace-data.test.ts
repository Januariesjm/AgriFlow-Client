import {
  PRICE_TICKER_ITEMS,
  MARKETPLACE_FEATURES,
  HOME_PLACEHOLDERS,
} from "@/lib/data/marketplace"

describe("Marketplace Homepage Data", () => {
  test("exports price ticker items with location and price trend", () => {
    expect(PRICE_TICKER_ITEMS.length).toBeGreaterThan(0)
    expect(PRICE_TICKER_ITEMS[0]).toHaveProperty("crop")
    expect(PRICE_TICKER_ITEMS[0]).toHaveProperty("trend")
  })

  test("exports marketplace core features", () => {
    expect(MARKETPLACE_FEATURES.length).toBe(6)
    expect(MARKETPLACE_FEATURES[0].title).toBe("Product Marketplace")
  })

  test("exports homepage fallback placeholder products", () => {
    expect(HOME_PLACEHOLDERS.length).toBe(5)
    expect(HOME_PLACEHOLDERS[0].isPlaceholder).toBe(true)
  })
})
