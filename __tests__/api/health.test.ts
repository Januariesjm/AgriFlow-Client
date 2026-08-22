import { getHealthStatus } from "@/app/api/health/route"

describe("GET /api/health Endpoint", () => {
  test("returns valid health status payload structure", () => {
    const data = getHealthStatus()

    expect(data.status).toBe("ok")
    expect(data.service).toBe("agriflow-client")
    expect(typeof data.timestamp).toBe("string")
    expect(typeof data.uptime).toBe("number")
    expect(typeof data.environment).toBe("string")
  })
})
