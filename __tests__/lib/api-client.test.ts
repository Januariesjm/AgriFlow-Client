import { clientApiGet, clientApiPost, clientApiPut, clientApiPatch, clientApiDelete } from "@/lib/api-client"
import { api } from "@/lib/api"
import { supabase } from "@/lib/supabase"

jest.mock("@/lib/api")
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}))

describe("lib/api-client", () => {
  const mockToken = "supabase-session-token"

  beforeEach(() => {
    jest.clearAllMocks()
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: {
        session: { access_token: mockToken },
      },
    })
  })

  it("calls api.get with path and auth token", async () => {
    ;(api.get as jest.Mock).mockResolvedValue({ data: 123 })
    const res = await clientApiGet<{ data: number }>("resource")

    expect(supabase.auth.getSession).toHaveBeenCalled()
    expect(api.get).toHaveBeenCalledWith("resource", mockToken)
    expect(res).toEqual({ data: 123 })
  })

  it("calls api.post with path, body and auth token", async () => {
    ;(api.post as jest.Mock).mockResolvedValue({ success: true })
    const body = { title: "New Item" }
    const res = await clientApiPost<{ success: boolean }>("resource", body)

    expect(api.post).toHaveBeenCalledWith("resource", body, mockToken)
    expect(res).toEqual({ success: true })
  })

  it("calls api.put with path, body and auth token", async () => {
    ;(api.put as jest.Mock).mockResolvedValue({ updated: true })
    const body = { title: "Updated Item" }
    const res = await clientApiPut<{ updated: boolean }>("resource/1", body)

    expect(api.put).toHaveBeenCalledWith("resource/1", body, mockToken)
    expect(res).toEqual({ updated: true })
  })

  it("calls api.patch with path, body and auth token", async () => {
    ;(api.patch as jest.Mock).mockResolvedValue({ patched: true })
    const body = { status: "inactive" }
    const res = await clientApiPatch<{ patched: boolean }>("resource/1", body)

    expect(api.patch).toHaveBeenCalledWith("resource/1", body, mockToken)
    expect(res).toEqual({ patched: true })
  })

  it("calls api.delete with path and auth token", async () => {
    ;(api.delete as jest.Mock).mockResolvedValue({ deleted: true })
    const res = await clientApiDelete<{ deleted: boolean }>("resource/1")

    expect(api.delete).toHaveBeenCalledWith("resource/1", mockToken)
    expect(res).toEqual({ deleted: true })
  })

  it("handles empty auth session gracefully", async () => {
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    })
    ;(api.get as jest.Mock).mockResolvedValue({ publicData: true })

    const res = await clientApiGet<{ publicData: boolean }>("public-resource")
    expect(api.get).toHaveBeenCalledWith("public-resource", undefined)
    expect(res).toEqual({ publicData: true })
  })
})
