import { api } from "@/lib/api"

describe("lib/api", () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it("makes successful GET request with authorization token", async () => {
    const mockResponse = { data: "success" }
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    } as unknown as Response)

    const result = await api.get<{ data: string }>("test-endpoint", "test-token")

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:4000/api/test-endpoint",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        }),
      })
    )
    expect(result).toEqual(mockResponse)
  })

  it("makes successful POST request with body and without token", async () => {
    const mockResponse = { id: 1 }
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    } as unknown as Response)

    const body = { name: "test item" }
    const result = await api.post<{ id: number }>("items", body)

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:4000/api/items",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    )
    expect(result).toEqual(mockResponse)
  })

  it("makes successful PUT request", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ updated: true }),
    } as unknown as Response)

    const result = await api.put<{ updated: boolean }>("items/1", { name: "updated" }, "token")
    expect(result).toEqual({ updated: true })
  })

  it("makes successful PATCH request", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ patched: true }),
    } as unknown as Response)

    const result = await api.patch<{ patched: boolean }>("items/1", { status: "active" }, "token")
    expect(result).toEqual({ patched: true })
  })

  it("makes successful DELETE request", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ deleted: true }),
    } as unknown as Response)

    const result = await api.delete<{ deleted: boolean }>("items/1", "token")
    expect(result).toEqual({ deleted: true })
  })

  it("throws custom error message when response is not ok and provides json error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ error: "Invalid payload provided" }),
    } as unknown as Response)

    await expect(api.get("invalid")).rejects.toThrow("Invalid payload provided")
  })

  it("throws fallback HTTP status error when response is not ok and json fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockRejectedValue(new Error("JSON parse error")),
    } as unknown as Response)

    await expect(api.get("server-error")).rejects.toThrow("HTTP error! status: 500")
  })
})
