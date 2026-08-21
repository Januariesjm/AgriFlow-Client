export type LogLevel = "info" | "warn" | "error" | "debug"

export interface LogEntry {
  timestamp: string
  level: LogLevel
  module: string
  message: string
  error?: Record<string, unknown> | string
  metadata?: Record<string, unknown>
}

class Logger {
  private formatError(error: unknown): Record<string, unknown> | string | undefined {
    if (!error) return undefined
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }
    return String(error)
  }

  private createLogEntry(
    level: LogLevel,
    moduleName: string,
    message: string,
    error?: unknown,
    metadata?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      module: moduleName,
      message,
      ...(error !== undefined && { error: this.formatError(error) }),
      ...(metadata && { metadata }),
    }
  }

  log(level: LogLevel, moduleName: string, message: string, error?: unknown, metadata?: Record<string, unknown>): LogEntry {
    const entry = this.createLogEntry(level, moduleName, message, error, metadata)
    
    // Emit structured JSON object
    const consoleMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.log
    consoleMethod(JSON.stringify(entry))
    
    return entry
  }

  info(moduleName: string, message: string, metadata?: Record<string, unknown>): LogEntry {
    return this.log("info", moduleName, message, undefined, metadata)
  }

  warn(moduleName: string, message: string, error?: unknown, metadata?: Record<string, unknown>): LogEntry {
    return this.log("warn", moduleName, message, error, metadata)
  }

  error(moduleName: string, message: string, error?: unknown, metadata?: Record<string, unknown>): LogEntry {
    return this.log("error", moduleName, message, error, metadata)
  }

  debug(moduleName: string, message: string, metadata?: Record<string, unknown>): LogEntry {
    return this.log("debug", moduleName, message, undefined, metadata)
  }
}

export const logger = new Logger()
