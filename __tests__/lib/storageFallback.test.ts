import { loadWithFallback } from "@/lib/storageFallback"

describe("loadWithFallback Helper", () => {
  beforeEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()
  })

  test("returns and caches remote data on API success", async () => {
    const fetchFn = jest.fn().mockResolvedValue({ id: 1, name: "Remote Depot" })
    const seed = { id: 0, name: "Seed Depot" }

    const result = await loadWithFallback("test_key", fetchFn, seed)

    expect(result).toEqual({ id: 1, name: "Remote Depot" })
    expect(localStorage.getItem("test_key")).toBe(JSON.stringify({ id: 1, name: "Remote Depot" }))
  })

  test("recovers cached data from localStorage when API fails", async () => {
    localStorage.setItem("test_key", JSON.stringify({ id: 99, name: "Cached Depot" }))
    const fetchFn = jest.fn().mockRejectedValue(new Error("Network Error"))
    const seed = { id: 0, name: "Seed Depot" }

    const result = await loadWithFallback("test_key", fetchFn, seed)

    expect(result).toEqual({ id: 99, name: "Cached Depot" })
  })

  test("returns seed data and seeds localStorage when API fails and cache is empty", async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error("500 Server Error"))
    const seed = { id: 5, name: "Default Seed Depot" }

    const result = await loadWithFallback("test_key", fetchFn, seed)

    expect(result).toEqual(seed)
    expect(localStorage.getItem("test_key")).toBe(JSON.stringify(seed))
  })
})
