import { NextResponse } from "next/server"

export interface MemoryMetrics {
  rss: number
  heapTotal: number
  heapUsed: number
  external?: number
}

export interface MetricsResponse {
  status: string
  timestamp: string
  service: string
  version: string
  environment: string
  uptime: number
  nodeVersion: string
  memoryUsage: MemoryMetrics
}

export function getSystemMetrics(): MetricsResponse {
  const memory = typeof process !== "undefined" && process.memoryUsage ? process.memoryUsage() : { rss: 0, heapTotal: 0, heapUsed: 0 }
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "agriflow-client",
    version: "0.3.0",
    environment: process.env.NODE_ENV || "development",
    uptime: typeof process !== "undefined" && typeof process.uptime === "function" ? process.uptime() : 0,
    nodeVersion: typeof process !== "undefined" ? process.version || "unknown" : "unknown",
    memoryUsage: {
      rss: memory.rss,
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      external: memory.external,
    },
  }
}

export async function GET() {
  const metrics = getSystemMetrics()
  return NextResponse.json(metrics, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  })
}
