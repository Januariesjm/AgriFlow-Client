import {
  initErrorTracking,
  captureException,
  captureMessage,
  getErrorTrackingState,
} from "@/lib/errorTracking"

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  init: jest.fn(),
}))

import * as Sentry from "@sentry/nextjs"
import { logger } from "@/lib/logger"

describe("Error Tracking Module", () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_SENTRY_DSN
    delete process.env.ENABLE_ERROR_TRACKING
  })

  afterAll(() => {
    process.env = originalEnv
  })

  test("defaults to no-op mode when env vars are unset", () => {
    const enabled = initErrorTracking()
    expect(enabled).toBe(false)
    const state = getErrorTrackingState()
    expect(state.isInitialized).toBe(true)
    expect(state.trackingEnabled).toBe(false)
  })

  test("enables tracking when dsn config is provided", () => {
    const enabled = initErrorTracking({ dsn: "https://mock@sentry.io/123", environment: "test" })
    expect(enabled).toBe(true)
    const state = getErrorTrackingState()
    expect(state.trackingEnabled).toBe(true)
  })

  test("captures exception with Sentry when tracking is enabled", () => {
    initErrorTracking({ dsn: "https://mock@sentry.io/123" })
    const testErr = new Error("Sentry test error")
    captureException(testErr, { page: "/dashboard" })
    expect(Sentry.captureException).toHaveBeenCalledWith(testErr, { extra: { page: "/dashboard" } })
  })

  test("forwards logger.error to Sentry when ENABLE_ERROR_TRACKING is true", () => {
    process.env.ENABLE_ERROR_TRACKING = "true"
    process.env.NEXT_PUBLIC_SENTRY_DSN = "https://mock@sentry.io/123"
    initErrorTracking()

    const err = new Error("Logger error forwarded")
    logger.error("TestModule", "An error occurred", err, { orderId: "123" })

    expect(Sentry.captureException).toHaveBeenCalled()
  })

  test("captures message without throwing", () => {
    expect(() => {
      captureMessage("System warning message", "warn")
    }).not.toThrow()
  })
})
