// Simple logging utility for the application

type LogLevel = "info" | "warn" | "error" | "debug"

interface LogData {
  message: string
  userId?: string
  action?: string
  resource?: string
  resourceId?: string
  error?: any
  details?: any
}

class Logger {
  private logToConsole(level: LogLevel, data: LogData) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      ...data,
      error: data.error ? this.formatError(data.error) : undefined,
    }

    switch (level) {
      case "info":
        console.log(JSON.stringify(logEntry))
        break
      case "warn":
        console.warn(JSON.stringify(logEntry))
        break
      case "error":
        console.error(JSON.stringify(logEntry))
        break
      case "debug":
        console.debug(JSON.stringify(logEntry))
        break
    }
  }

  private formatError(error: any) {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }
    return error
  }

  public info(data: LogData) {
    this.logToConsole("info", data)
  }

  public warn(data: LogData) {
    this.logToConsole("warn", data)
  }

  public error(data: LogData) {
    this.logToConsole("error", data)
  }

  public debug(data: LogData) {
    this.logToConsole("debug", data)
  }
}

export const logger = new Logger()

// Helper functions for common logging patterns
export function logDbOperation(
  operation: "select" | "insert" | "update" | "delete",
  resource: string,
  userId?: string,
  details?: any,
) {
  logger.info({
    message: `Database ${operation} operation on ${resource}`,
    userId,
    action: operation,
    resource,
    details,
  })
}

export function logApiRequest(request: Request) {
  const url = new URL(request.url)
  logger.info({
    message: `API request: ${request.method} ${url.pathname}`,
    action: request.method,
    resource: url.pathname,
    details: {
      query: Object.fromEntries(url.searchParams.entries()),
    },
  })
}
