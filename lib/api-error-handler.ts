import { NextResponse } from "next/server"

// Error types
export enum ErrorType {
  VALIDATION = "VALIDATION_ERROR",
  AUTHENTICATION = "AUTHENTICATION_ERROR",
  AUTHORIZATION = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND_ERROR",
  RATE_LIMIT = "RATE_LIMIT_ERROR",
  SERVER = "SERVER_ERROR",
  DATABASE = "DATABASE_ERROR",
  EXTERNAL_SERVICE = "EXTERNAL_SERVICE_ERROR",
}

// Error response structure
export interface ErrorResponse {
  error: {
    type: ErrorType
    message: string
    details?: any
    code?: string
  }
}

// Error handler function
export function handleApiError(error: unknown, defaultType = ErrorType.SERVER): NextResponse<ErrorResponse> {
  console.error("API Error:", error)

  // Default error response
  const errorResponse: ErrorResponse = {
    error: {
      type: defaultType,
      message: "An unexpected error occurred",
    },
  }

  // Status code mapping
  let statusCode = 500

  // Handle known error types
  if (error && typeof error === "object") {
    if ("type" in error && typeof error.type === "string") {
      errorResponse.error.type = error.type as ErrorType
    }

    if ("message" in error && typeof error.message === "string") {
      errorResponse.error.message = error.message
    }

    if ("details" in error) {
      errorResponse.error.details = error.details
    }

    if ("code" in error && typeof error.code === "string") {
      errorResponse.error.code = error.code
    }

    // Set appropriate status code based on error type
    switch (errorResponse.error.type) {
      case ErrorType.VALIDATION:
        statusCode = 400
        break
      case ErrorType.AUTHENTICATION:
        statusCode = 401
        break
      case ErrorType.AUTHORIZATION:
        statusCode = 403
        break
      case ErrorType.NOT_FOUND:
        statusCode = 404
        break
      case ErrorType.RATE_LIMIT:
        statusCode = 429
        break
      case ErrorType.DATABASE:
      case ErrorType.EXTERNAL_SERVICE:
      case ErrorType.SERVER:
      default:
        statusCode = 500
        break
    }
  }

  // Log error to monitoring service in production
  if (process.env.NODE_ENV === "production") {
    // TODO: Add your error logging service here
    // Example: await logErrorToService(errorResponse, error);
  }

  return NextResponse.json(errorResponse, { status: statusCode })
}

// Helper function to create typed errors
export function createApiError(type: ErrorType, message: string, details?: any, code?: string): ErrorResponse["error"] {
  return { type, message, details, code }
}
