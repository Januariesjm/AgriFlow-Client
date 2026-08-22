import { getSystemMetrics } from "@/app/api/metrics/route"

describe("Metrics API Route", () => {
  test("getSystemMetrics returns valid telemetry payload", () => {
    const metrics = getSystemMetrics()

    expect(metrics.status).toBe("ok")
    expect(metrics.service).toBe("agriflow-client")
    expect(metrics.version).toBe("0.3.0")
    expect(typeof metrics.uptime).toBe("number")
    expect(typeof metrics.timestamp).toBe("string")
    expect(metrics.memoryUsage).toHaveProperty("rss")
    expect(metrics.memoryUsage).toHaveProperty("heapTotal")
    expect(metrics.memoryUsage).toHaveProperty("heapUsed")
  })
})
