import { renderHook, act, waitFor } from "@testing-library/react"
import { useResourceWithFallback } from "@/lib/hooks/useResourceWithFallback"
import { useSession } from "@/lib/hooks/useSession"
import { clientApiGet, clientApiPost, clientApiDelete } from "@/lib/api-client"

jest.mock("@/lib/hooks/useSession")
jest.mock("@/lib/api-client")

interface Depot {
  id: string
  name: string
  capacity: number
}

const SEED: Depot[] = [{ id: "seed-1", name: "Seed Depot", capacity: 100 }]

describe("useResourceWithFallback", () => {
  const mockSession = {
    session: { user: { id: "user-42", email: "owner@agriflow.com" } },
    loading: false,
  }

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue(mockSession)
  })

  test("loads items from the API and caches them under the user-scoped key", async () => {
    const remote: Depot[] = [{ id: "d-1", name: "Remote Depot", capacity: 400 }]
    ;(clientApiGet as jest.Mock).mockResolvedValue(remote)

    const { result } = renderHook(() => useResourceWithFallback<Depot>("depots", "af_depots", SEED))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items).toEqual(remote)
    expect(JSON.parse(localStorage.getItem("af_depots_user-42")!)).toEqual(remote)
  })

  test("falls back to seed data when the API is unreachable", async () => {
    ;(clientApiGet as jest.Mock).mockRejectedValue(new Error("network down"))

    const { result } = renderHook(() => useResourceWithFallback<Depot>("depots", "af_depots", SEED))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items).toEqual(SEED)
    expect(result.current.error).toBe("")
  })

  test("filters out items rejected by the validator", async () => {
    ;(clientApiGet as jest.Mock).mockResolvedValue([
      { id: "ok", name: "Valid", capacity: 10 },
      { id: "bad", name: "", capacity: -1 },
    ])

    const { result } = renderHook(() =>
      useResourceWithFallback<Depot>("depots", "af_depots", [], (item) => (item as Depot).capacity > 0)
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items.map((i) => i.id)).toEqual(["ok"])
  })

  test("addResource prepends the created item and reports success", async () => {
    ;(clientApiGet as jest.Mock).mockResolvedValue([])
    ;(clientApiPost as jest.Mock).mockResolvedValue({ id: "d-9", name: "New Depot", capacity: 250 })

    const { result } = renderHook(() => useResourceWithFallback<Depot>("depots", "af_depots", []))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addResource({ name: "New Depot", capacity: 250 })
    })

    expect(result.current.items[0]).toEqual({ id: "d-9", name: "New Depot", capacity: 250 })
    expect(result.current.success).toMatch(/registered successfully/i)
    expect(JSON.parse(localStorage.getItem("af_depots_user-42")!)).toHaveLength(1)
  })

  test("addResource falls back to an offline item when the API post fails", async () => {
    ;(clientApiGet as jest.Mock).mockResolvedValue([])
    ;(clientApiPost as jest.Mock).mockRejectedValue(new Error("offline"))

    const { result } = renderHook(() => useResourceWithFallback<Depot>("depots", "af_depots", []))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addResource({ name: "Offline Depot", capacity: 80 }, "depot")
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toMatch(/^depot-/)
    expect(result.current.items[0].name).toBe("Offline Depot")
    expect(result.current.error).toBe("")
  })

  test("deleteResource removes the item and persists the updated list", async () => {
    const remote: Depot[] = [
      { id: "d-1", name: "Keep", capacity: 100 },
      { id: "d-2", name: "Drop", capacity: 50 },
    ]
    ;(clientApiGet as jest.Mock).mockResolvedValue(remote)
    ;(clientApiDelete as jest.Mock).mockResolvedValue({ success: true })

    const { result } = renderHook(() => useResourceWithFallback<Depot>("depots", "af_depots", []))
    await waitFor(() => expect(result.current.items).toHaveLength(2))

    await act(async () => {
      await result.current.deleteResource("d-2")
    })

    expect(clientApiDelete).toHaveBeenCalledWith("depots/d-2")
    expect(result.current.items.map((i) => i.id)).toEqual(["d-1"])
    expect(result.current.success).toMatch(/removed successfully/i)
  })

  test("deleteResource still updates the local store when the API delete fails", async () => {
    ;(clientApiGet as jest.Mock).mockResolvedValue([{ id: "d-1", name: "Solo", capacity: 10 }])
    ;(clientApiDelete as jest.Mock).mockRejectedValue(new Error("gateway timeout"))

    const { result } = renderHook(() => useResourceWithFallback<Depot>("depots", "af_depots", []))
    await waitFor(() => expect(result.current.items).toHaveLength(1))

    await act(async () => {
      await result.current.deleteResource("d-1")
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.error).toBe("")
  })

  test("survives localStorage persistence failures without losing state", async () => {
    ;(clientApiGet as jest.Mock).mockResolvedValue([])
    ;(clientApiPost as jest.Mock).mockResolvedValue({ id: "d-3", name: "Quota Depot", capacity: 60 })

    const { result } = renderHook(() => useResourceWithFallback<Depot>("depots", "af_depots", []))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const setItemSpy = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError")
    })

    await act(async () => {
      await result.current.addResource({ name: "Quota Depot", capacity: 60 })
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.success).toMatch(/registered successfully/i)

    setItemSpy.mockRestore()
  })
})
