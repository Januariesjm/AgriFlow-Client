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

  test("emits formatted info entry as structured JSON string", () => {
    const entry = logger.info("TestModule", "Test info message", { user: "123" })

    expect(entry.level).toBe("info")
    expect(entry.module).toBe("TestModule")
    expect(entry.message).toBe("Test info message")
    expect(entry.metadata).toEqual({ user: "123" })

    const expectedJson = JSON.stringify(entry)
    expect(consoleLogSpy).toHaveBeenCalledWith(expectedJson)
  })

  test("emits formatted warn entry with error details", () => {
    const err = new Error("Warning cause")
    const entry = logger.warn("WarnModule", "Something is unusual", err)

    expect(entry.level).toBe("warn")
    expect(entry.error).toEqual(
      expect.objectContaining({
        name: "Error",
        message: "Warning cause",
      })
    )

    const expectedJson = JSON.stringify(entry)
    expect(consoleWarnSpy).toHaveBeenCalledWith(expectedJson)
  })

  test("emits formatted error entry with stack trace", () => {
    const err = new TypeError("Failed to load network resource")
    const entry = logger.error("APIModule", "Network error occurred", err)

    expect(entry.level).toBe("error")
    expect(entry.module).toBe("APIModule")
    expect(entry.error).toEqual(
      expect.objectContaining({
        name: "TypeError",
        message: "Failed to load network resource",
      })
    )

    const expectedJson = JSON.stringify(entry)
    expect(consoleErrorSpy).toHaveBeenCalledWith(expectedJson)
  })

  test("emits debug log entries", () => {
    const entry = logger.debug("DebugModule", "Debugging state transition")

    expect(entry.level).toBe("debug")
    const expectedJson = JSON.stringify(entry)
    expect(consoleLogSpy).toHaveBeenCalledWith(expectedJson)
  })
})
