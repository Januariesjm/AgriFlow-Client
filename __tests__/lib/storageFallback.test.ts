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

  test("uses validator when provided on remote data", async () => {
    const fetchFn = jest.fn().mockResolvedValue({ id: 1, name: "Valid" })
    const validator = jest.fn().mockReturnValue(true)
    const seed = { id: 0, name: "Seed" }

    const result = await loadWithFallback("test_key", fetchFn, seed, validator)

    expect(validator).toHaveBeenCalledWith({ id: 1, name: "Valid" })
    expect(result).toEqual({ id: 1, name: "Valid" })
  })

  test("falls back when remote data fails validator check", async () => {
    const fetchFn = jest.fn().mockResolvedValue({ id: -1, name: "Invalid" })
    const validator = jest.fn().mockReturnValue(false)
    const seed = { id: 0, name: "Seed" }

    const result = await loadWithFallback("test_key", fetchFn, seed, validator)

    expect(validator).toHaveBeenCalledWith({ id: -1, name: "Invalid" })
    expect(result).toEqual(seed)
  })

  test("recovers cached data from localStorage when API fails", async () => {
    localStorage.setItem("test_key", JSON.stringify({ id: 99, name: "Cached Depot" }))
    const fetchFn = jest.fn().mockRejectedValue(new Error("Network Error"))
    const seed = { id: 0, name: "Seed Depot" }

    const result = await loadWithFallback("test_key", fetchFn, seed)

    expect(result).toEqual({ id: 99, name: "Cached Depot" })
  })

  test("falls back to seed data when localStorage contains corrupt JSON", async () => {
    localStorage.setItem("test_key", "invalid-json-{")
    const fetchFn = jest.fn().mockRejectedValue(new Error("Network Error"))
    const seed = { id: 0, name: "Seed Depot" }

    const result = await loadWithFallback("test_key", fetchFn, seed)

    expect(result).toEqual(seed)
    expect(localStorage.getItem("test_key")).toBe(JSON.stringify(seed))
  })

  test("returns seed data and seeds localStorage when API fails and cache is empty", async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error("500 Server Error"))
    const seed = { id: 5, name: "Default Seed Depot" }

    const result = await loadWithFallback("test_key", fetchFn, seed)

    expect(result).toEqual(seed)
    expect(localStorage.getItem("test_key")).toBe(JSON.stringify(seed))
  })
})
