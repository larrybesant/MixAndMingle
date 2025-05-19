type LogLevel = "debug" | "info" | "warn" | "error"

type LogData = {
  message: string
  userId?: string
  action?: string
  resource?: string
  resourceId?: string
  details?: Record<string, any>
  error?: Error | unknown
}

// Configure log levels based on environment
const LOG_LEVELS: Record<string, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const CURRENT_LOG_LEVEL = process.env.NODE_ENV === "production" ? "info" : "debug"

// Main logging function
export function log(level: LogLevel, data: LogData) {
  // Skip logging if level is below current log level
  if (LOG_LEVELS[level] < LOG_LEVELS[CURRENT_LOG_LEVEL]) {
    return
  }

  const timestamp = new Date().toISOString()
  const { message, userId, action, resource, resourceId, details, error } = data

  // Format the log entry
  const logEntry = {
    timestamp,
    level,
    message,
    userId: userId || "anonymous",
    action,
    resource,
    resourceId,
    details,
  }

  // Add error information if available
  if (error) {
    if (error instanceof Error) {
      Object.assign(logEntry, {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
      })
    } else {
      Object.assign(logEntry, { errorDetails: String(error) })
    }
  }

  // Log to appropriate output based on level
  switch (level) {
    case "debug":
      console.debug(JSON.stringify(logEntry))
      break
    case "info":
      console.info(JSON.stringify(logEntry))
      break
    case "warn":
      console.warn(JSON.stringify(logEntry))
      break
    case "error":
      console.error(JSON.stringify(logEntry))
      break
  }

  // In a production environment, you might want to send logs to a service
  if (process.env.NODE_ENV === "production" && level === "error") {
    // Example: send to logging service
    // sendToLoggingService(logEntry);
  }
}

// Convenience methods
export const logger = {
  debug: (data: Omit<LogData, "level">) => log("debug", data),
  info: (data: Omit<LogData, "level">) => log("info", data),
  warn: (data: Omit<LogData, "level">) => log("warn", data),
  error: (data: Omit<LogData, "level">) => log("error", data),
}

// Function to log API requests
export function logApiRequest(req: Request, userId?: string) {
  const url = new URL(req.url)

  logger.info({
    message: `API Request: ${req.method} ${url.pathname}`,
    userId,
    action: req.method,
    resource: url.pathname,
    details: {
      query: Object.fromEntries(url.searchParams.entries()),
      headers: Object.fromEntries(
        Array.from(req.headers.entries()).filter(([key]) => !["authorization", "cookie"].includes(key.toLowerCase())),
      ),
    },
  })
}

// Function to log database operations
export function logDbOperation(operation: string, table: string, userId?: string, details?: Record<string, any>) {
  logger.debug({
    message: `Database ${operation} on ${table}`,
    userId,
    action: operation,
    resource: table,
    details,
  })
}
