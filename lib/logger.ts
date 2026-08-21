export type LogLevel = "info" | "warn" | "error" | "debug"

export interface LogEntry {
  timestamp: string
  level: LogLevel
  context: string
  message: string
  error?: unknown
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
    context: string,
    message: string,
    error?: unknown,
    metadata?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      ...(error !== undefined && { error: this.formatError(error) }),
      ...(metadata && { metadata }),
    }
  }

  log(level: LogLevel, context: string, message: string, error?: unknown, metadata?: Record<string, unknown>): LogEntry {
    const entry = this.createLogEntry(level, context, message, error, metadata)
    
    // In production or development, log structured output
    const consoleMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.log
    consoleMethod(`[${entry.timestamp}] [${level.toUpperCase()}] [${context}] ${message}`, entry)
    
    return entry
  }

  info(context: string, message: string, metadata?: Record<string, unknown>): LogEntry {
    return this.log("info", context, message, undefined, metadata)
  }

  warn(context: string, message: string, error?: unknown, metadata?: Record<string, unknown>): LogEntry {
    return this.log("warn", context, message, error, metadata)
  }

  error(context: string, message: string, error?: unknown, metadata?: Record<string, unknown>): LogEntry {
    return this.log("error", context, message, error, metadata)
  }

  debug(context: string, message: string, metadata?: Record<string, unknown>): LogEntry {
    return this.log("debug", context, message, undefined, metadata)
  }
}

export const logger = new Logger()
