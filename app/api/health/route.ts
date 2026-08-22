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
    uptime: process.uptime(),
  }
}

export async function GET() {
  const healthData = getHealthStatus()
  return new Response(JSON.stringify(healthData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  })
}
