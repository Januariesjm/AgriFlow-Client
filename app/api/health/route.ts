import { NextResponse } from "next/server"

export interface HealthResponse {
  status: string
  timestamp: string
  service: string
  version: string
  environment: string
  uptime: number
}

export function getHealthStatus(): HealthResponse {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "agriflow-client",
    version: "0.3.0",
    environment: process.env.NODE_ENV || "development",
    uptime: typeof process !== "undefined" && typeof process.uptime === "function" ? process.uptime() : 0,
  }
}

export async function GET() {
  const healthData = getHealthStatus()
  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  })
}
