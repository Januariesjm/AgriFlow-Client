import { logger } from "@/lib/logger"

describe("Structured Logger Service", () => {
  let consoleLogSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {})
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {})
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test("emits formatted info entry", () => {
    const entry = logger.info("TestContext", "Test info message", { user: "123" })

    expect(entry.level).toBe("info")
    expect(entry.context).toBe("TestContext")
    expect(entry.message).toBe("Test info message")
    expect(entry.metadata).toEqual({ user: "123" })
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("[INFO] [TestContext] Test info message"),
      entry
    )
  })

  test("emits formatted warn entry with error details", () => {
    const err = new Error("Warning cause")
    const entry = logger.warn("WarnContext", "Something is unusual", err)

    expect(entry.level).toBe("warn")
    expect(entry.error).toEqual(
      expect.objectContaining({
        name: "Error",
        message: "Warning cause",
      })
    )
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[WARN] [WarnContext] Something is unusual"),
      entry
    )
  })

  test("emits formatted error entry with stack trace", () => {
    const err = new TypeError("Failed to load network resource")
    const entry = logger.error("APIContext", "Network error occurred", err)

    expect(entry.level).toBe("error")
    expect(entry.context).toBe("APIContext")
    expect(entry.error).toEqual(
      expect.objectContaining({
        name: "TypeError",
        message: "Failed to load network resource",
      })
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("[ERROR] [APIContext] Network error occurred"),
      entry
    )
  })

  test("emits debug log entries", () => {
    const entry = logger.debug("DebugContext", "Debugging state transition")

    expect(entry.level).toBe("debug")
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("[DEBUG] [DebugContext] Debugging state transition"),
      entry
    )
  })
})
