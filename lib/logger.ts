export type LogLevel = "info" | "warn" | "error" | "debug"

export interface LogContext {
  module: string
  action?: string
  userId?: string
  metadata?: Record<string, unknown>
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  module: string
  action?: string
  userId?: string
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
    context: string | LogContext,
    message: string,
    error?: unknown,
    metadata?: Record<string, unknown>
  ): LogEntry {
    const isContextObj = typeof context === "object" && context !== null
    const moduleName = isContextObj ? context.module : context
    const action = isContextObj ? context.action : undefined
    const userId = isContextObj ? context.userId : undefined
    const combinedMetadata = isContextObj && context.metadata ? { ...context.metadata, ...metadata } : metadata

    return {
      timestamp: new Date().toISOString(),
      level,
      module: moduleName,
      ...(action && { action }),
      ...(userId && { userId }),
      message,
      ...(error !== undefined && { error: this.formatError(error) }),
      ...(combinedMetadata && Object.keys(combinedMetadata).length > 0 && { metadata: combinedMetadata }),
    }
  }

  log(level: LogLevel, context: string | LogContext, message: string, error?: unknown, metadata?: Record<string, unknown>): LogEntry {
    const entry = this.createLogEntry(level, context, message, error, metadata)
    
    // Emit structured JSON object
    const consoleMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.log
    consoleMethod(JSON.stringify(entry))
    
    return entry
  }

  info(context: string | LogContext, message: string, metadata?: Record<string, unknown>): LogEntry {
    return this.log("info", context, message, undefined, metadata)
  }

  warn(context: string | LogContext, message: string, error?: unknown, metadata?: Record<string, unknown>): LogEntry {
    return this.log("warn", context, message, error, metadata)
  }

  error(context: string | LogContext, message: string, error?: unknown, metadata?: Record<string, unknown>): LogEntry {
    const entry = this.log("error", context, message, error, metadata)
    if (typeof process !== "undefined" && process.env.ENABLE_ERROR_TRACKING === "true") {
      try {
        const { captureException } = require("./errorTracking")
        captureException(error || new Error(message), { context, message, ...metadata })
      } catch {
        // Safe fallback if module not loaded
      }
    }
    return entry
  }

  debug(context: string | LogContext, message: string, metadata?: Record<string, unknown>): LogEntry {
    return this.log("debug", context, message, undefined, metadata)
  }
}

export const logger = new Logger()

