import { logger } from "@/lib/logger"

describe("Logger", () => {
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

  test("logs info message with string module name", () => {
    const entry = logger.info("TestModule", "Operation succeeded")
    expect(entry.level).toBe("info")
    expect(entry.module).toBe("TestModule")
    expect(entry.message).toBe("Operation succeeded")
    expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(entry))
  })

  test("logs warn message with structured context object", () => {
    const context = {
      module: "WarehouseModule",
      action: "FETCH_INVENTORY",
      userId: "user-456",
      metadata: { region: "Eldoret" },
    }
    const entry = logger.warn(context, "Inventory fetch retry", new Error("Timeout"))

    expect(entry.level).toBe("warn")
    expect(entry.module).toBe("WarehouseModule")
    expect(entry.action).toBe("FETCH_INVENTORY")
    expect(entry.userId).toBe("user-456")
    expect(entry.message).toBe("Inventory fetch retry")
    expect(entry.metadata).toEqual({ region: "Eldoret" })
    expect(entry.error).toMatchObject({ name: "Error", message: "Timeout" })
    expect(consoleWarnSpy).toHaveBeenCalledWith(JSON.stringify(entry))
  })

  test("logs error message with error object", () => {
    const err = new Error("Database connection lost")
    const entry = logger.error("DBModule", "Query failed", err)

    expect(entry.level).toBe("error")
    expect(entry.module).toBe("DBModule")
    expect(entry.error).toMatchObject({
      name: "Error",
      message: "Database connection lost",
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith(JSON.stringify(entry))
  })

  test("logs debug message", () => {
    const entry = logger.debug("AuthModule", "Token refresh triggered")
    expect(entry.level).toBe("debug")
    expect(entry.module).toBe("AuthModule")
    expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(entry))
  })
})
