import * as Sentry from "@sentry/nextjs"
import { logger } from "./logger"

export interface ErrorTrackingConfig {
  dsn?: string
  environment?: string
  enabled?: boolean
}

let isInitialized = false
let trackingEnabled = false

export function initErrorTracking(config?: ErrorTrackingConfig): boolean {
  const dsn = config?.dsn || process.env.NEXT_PUBLIC_SENTRY_DSN
  const explicitEnable = config?.enabled ?? process.env.ENABLE_ERROR_TRACKING === "true"

  if (dsn || explicitEnable) {
    trackingEnabled = true
    isInitialized = true
  } else {
    trackingEnabled = false
    isInitialized = true
  }

  return trackingEnabled
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!isInitialized) {
    initErrorTracking()
  }

  if (trackingEnabled) {
    Sentry.captureException(error, { extra: context })
  }
}

export function captureMessage(message: string, level: "info" | "warn" | "error" = "info"): void {
  if (!isInitialized) {
    initErrorTracking()
  }

  logger.log(level, "ErrorTracking", message)
}

export function getErrorTrackingState(): { isInitialized: boolean; trackingEnabled: boolean } {
  return { isInitialized, trackingEnabled }
}
