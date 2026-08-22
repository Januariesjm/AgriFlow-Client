import {
  initErrorTracking,
  captureException,
  captureMessage,
  getErrorTrackingState,
} from "@/lib/errorTracking"

describe("Error Tracking Module", () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
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

  test("captures exception without throwing in no-op mode", () => {
    expect(() => {
      captureException(new Error("Test error"), { page: "/dashboard" })
    }).not.toThrow()
  })

  test("captures message without throwing", () => {
    expect(() => {
      captureMessage("System warning message", "warn")
    }).not.toThrow()
  })
})
