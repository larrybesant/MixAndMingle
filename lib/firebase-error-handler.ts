// Firebase error codes and messages
export type FirebaseErrorCode =
  // Auth error codes
  | "auth/email-already-in-use"
  | "auth/invalid-email"
  | "auth/user-disabled"
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/invalid-credential"
  | "auth/operation-not-allowed"
  | "auth/weak-password"
  | "auth/network-request-failed"
  | "auth/too-many-requests"
  | "auth/popup-closed-by-user"
  | "auth/popup-blocked"
  | "auth/account-exists-with-different-credential"
  | "auth/invalid-verification-code"
  | "auth/invalid-verification-id"
  | "auth/missing-verification-code"
  | "auth/missing-verification-id"
  | "auth/quota-exceeded"
  | "auth/timeout"
  | "auth/web-storage-unsupported"
  | "auth/unauthorized-domain"
  // Firestore error codes
  | "firestore/cancelled"
  | "firestore/unknown"
  | "firestore/invalid-argument"
  | "firestore/deadline-exceeded"
  | "firestore/not-found"
  | "firestore/already-exists"
  | "firestore/permission-denied"
  | "firestore/resource-exhausted"
  | "firestore/failed-precondition"
  | "firestore/aborted"
  | "firestore/out-of-range"
  | "firestore/unimplemented"
  | "firestore/internal"
  | "firestore/unavailable"
  | "firestore/data-loss"
  | "firestore/unauthenticated"
  // Storage error codes
  | "storage/unknown"
  | "storage/object-not-found"
  | "storage/bucket-not-found"
  | "storage/project-not-found"
  | "storage/quota-exceeded"
  | "storage/unauthenticated"
  | "storage/unauthorized"
  | "storage/retry-limit-exceeded"
  | "storage/invalid-checksum"
  | "storage/canceled"
  | "storage/invalid-event-name"
  | "storage/invalid-url"
  | "storage/invalid-argument"
  | "storage/no-default-bucket"
  | "storage/cannot-slice-blob"
  | "storage/server-file-wrong-size"
  // Generic error codes
  | "unknown-error"
  | "network-error"
  | "server-error"
  | "client-error"
  | "timeout-error"
  | "offline-error"

// Error severity levels
export type ErrorSeverity = "info" | "warning" | "error" | "critical"

// Error context for additional information
export interface ErrorContext {
  userId?: string
  path?: string
  operation?: string
  timestamp?: number
  additionalData?: Record<string, any>
}

// Firebase error structure
export interface FirebaseError {
  code: FirebaseErrorCode | string
  message: string
  severity: ErrorSeverity
  userMessage: string
  context?: ErrorContext
  originalError?: any
}

// Map Firebase error codes to user-friendly messages
const errorMessages: Record<FirebaseErrorCode, { message: string; severity: ErrorSeverity }> = {
  // Auth errors
  "auth/email-already-in-use": {
    message: "This email is already in use. Please try logging in or use a different email.",
    severity: "warning",
  },
  "auth/invalid-email": {
    message: "The email address is not valid. Please check and try again.",
    severity: "warning",
  },
  "auth/user-disabled": {
    message: "This account has been disabled. Please contact support for assistance.",
    severity: "error",
  },
  "auth/user-not-found": {
    message: "No account found with this email. Please check your email or sign up.",
    severity: "warning",
  },
  "auth/wrong-password": {
    message: "Incorrect password. Please try again or reset your password.",
    severity: "warning",
  },
  "auth/invalid-credential": {
    message: "The provided credentials are invalid. Please try again.",
    severity: "warning",
  },
  "auth/operation-not-allowed": {
    message: "This operation is not allowed. Please contact support.",
    severity: "error",
  },
  "auth/weak-password": {
    message: "The password is too weak. Please choose a stronger password.",
    severity: "warning",
  },
  "auth/network-request-failed": {
    message: "Network error. Please check your internet connection and try again.",
    severity: "warning",
  },
  "auth/too-many-requests": {
    message: "Too many attempts. Please try again later or reset your password.",
    severity: "warning",
  },
  "auth/popup-closed-by-user": {
    message: "Sign-in popup was closed before completing. Please try again.",
    severity: "info",
  },
  "auth/popup-blocked": {
    message: "Sign-in popup was blocked. Please allow popups for this site and try again.",
    severity: "warning",
  },
  "auth/account-exists-with-different-credential": {
    message: "An account already exists with the same email but different sign-in credentials.",
    severity: "warning",
  },
  "auth/invalid-verification-code": {
    message: "Invalid verification code. Please try again.",
    severity: "warning",
  },
  "auth/invalid-verification-id": {
    message: "Invalid verification ID. Please request a new verification code.",
    severity: "warning",
  },
  "auth/missing-verification-code": {
    message: "Please enter the verification code.",
    severity: "warning",
  },
  "auth/missing-verification-id": {
    message: "Missing verification ID. Please request a new verification code.",
    severity: "warning",
  },
  "auth/quota-exceeded": {
    message: "Quota exceeded. Please try again later.",
    severity: "error",
  },
  "auth/timeout": {
    message: "The operation has timed out. Please try again.",
    severity: "warning",
  },
  "auth/web-storage-unsupported": {
    message: "Web storage is not supported in this browser. Please use a different browser.",
    severity: "error",
  },
  "auth/unauthorized-domain": {
    message: "This domain is not authorized for OAuth operations. Please contact support.",
    severity: "error",
  },

  // Firestore errors
  "firestore/cancelled": {
    message: "The operation was cancelled. Please try again.",
    severity: "warning",
  },
  "firestore/unknown": {
    message: "An unknown error occurred. Please try again later.",
    severity: "error",
  },
  "firestore/invalid-argument": {
    message: "Invalid argument provided. Please check your input and try again.",
    severity: "warning",
  },
  "firestore/deadline-exceeded": {
    message: "Operation timed out. Please try again.",
    severity: "warning",
  },
  "firestore/not-found": {
    message: "The requested document was not found.",
    severity: "warning",
  },
  "firestore/already-exists": {
    message: "The document already exists. Please use a different ID.",
    severity: "warning",
  },
  "firestore/permission-denied": {
    message: "You don't have permission to perform this operation.",
    severity: "error",
  },
  "firestore/resource-exhausted": {
    message: "System resources have been exhausted. Please try again later.",
    severity: "error",
  },
  "firestore/failed-precondition": {
    message: "Operation failed due to a precondition failure.",
    severity: "error",
  },
  "firestore/aborted": {
    message: "The operation was aborted. Please try again.",
    severity: "warning",
  },
  "firestore/out-of-range": {
    message: "Operation was attempted past the valid range.",
    severity: "warning",
  },
  "firestore/unimplemented": {
    message: "This operation is not implemented or supported.",
    severity: "error",
  },
  "firestore/internal": {
    message: "An internal error occurred. Please try again later.",
    severity: "error",
  },
  "firestore/unavailable": {
    message: "The service is currently unavailable. Please try again later.",
    severity: "error",
  },
  "firestore/data-loss": {
    message: "Unrecoverable data loss or corruption. Please contact support.",
    severity: "critical",
  },
  "firestore/unauthenticated": {
    message: "You must be logged in to perform this operation.",
    severity: "warning",
  },

  // Storage errors
  "storage/unknown": {
    message: "An unknown error occurred. Please try again later.",
    severity: "error",
  },
  "storage/object-not-found": {
    message: "The requested file does not exist.",
    severity: "warning",
  },
  "storage/bucket-not-found": {
    message: "The storage bucket does not exist.",
    severity: "error",
  },
  "storage/project-not-found": {
    message: "The project does not exist.",
    severity: "error",
  },
  "storage/quota-exceeded": {
    message: "Storage quota exceeded. Please contact support.",
    severity: "error",
  },
  "storage/unauthenticated": {
    message: "You must be logged in to perform this operation.",
    severity: "warning",
  },
  "storage/unauthorized": {
    message: "You don't have permission to perform this operation.",
    severity: "error",
  },
  "storage/retry-limit-exceeded": {
    message: "Maximum retry time exceeded. Please try again later.",
    severity: "warning",
  },
  "storage/invalid-checksum": {
    message: "File checksum verification failed. Please try uploading again.",
    severity: "warning",
  },
  "storage/canceled": {
    message: "The operation was cancelled.",
    severity: "info",
  },
  "storage/invalid-event-name": {
    message: "Invalid event name provided.",
    severity: "warning",
  },
  "storage/invalid-url": {
    message: "Invalid URL provided.",
    severity: "warning",
  },
  "storage/invalid-argument": {
    message: "Invalid argument provided.",
    severity: "warning",
  },
  "storage/no-default-bucket": {
    message: "No default bucket found. Please contact support.",
    severity: "error",
  },
  "storage/cannot-slice-blob": {
    message: "Cannot slice blob. Please try with a different file.",
    severity: "warning",
  },
  "storage/server-file-wrong-size": {
    message: "File size verification failed. Please try uploading again.",
    severity: "warning",
  },

  // Generic errors
  "unknown-error": {
    message: "An unknown error occurred. Please try again later.",
    severity: "error",
  },
  "network-error": {
    message: "Network error. Please check your internet connection and try again.",
    severity: "warning",
  },
  "server-error": {
    message: "Server error. Please try again later.",
    severity: "error",
  },
  "client-error": {
    message: "An error occurred in the application. Please try again.",
    severity: "warning",
  },
  "timeout-error": {
    message: "The operation timed out. Please try again.",
    severity: "warning",
  },
  "offline-error": {
    message: "You are offline. Please check your internet connection and try again.",
    severity: "warning",
  },
}

// Function to handle Firebase errors
export function handleFirebaseError(error: any, context?: ErrorContext): FirebaseError {
  console.error("Firebase error:", error)

  // Extract error code and message
  let code = "unknown-error"
  let originalMessage = "An unknown error occurred"

  if (error && error.code) {
    code = error.code
    originalMessage = error.message || originalMessage
  } else if (error && error.message) {
    originalMessage = error.message

    // Try to extract code from message
    if (originalMessage.includes("auth/")) {
      const match = originalMessage.match(/auth\/[\w-]+/)
      if (match) code = match[0]
    } else if (originalMessage.includes("firestore/")) {
      const match = originalMessage.match(/firestore\/[\w-]+/)
      if (match) code = match[0]
    } else if (originalMessage.includes("storage/")) {
      const match = originalMessage.match(/storage\/[\w-]+/)
      if (match) code = match[0]
    }
  }

  // Get user-friendly message and severity
  const errorInfo = errorMessages[code as FirebaseErrorCode] || {
    message: "An error occurred. Please try again later.",
    severity: "error",
  }

  // Create error object
  const firebaseError: FirebaseError = {
    code,
    message: originalMessage,
    severity: errorInfo.severity,
    userMessage: errorInfo.message,
    context: {
      ...context,
      timestamp: Date.now(),
    },
    originalError: error,
  }

  // Log error to console with context
  logError(firebaseError)

  return firebaseError
}

// Function to log errors
function logError(error: FirebaseError): void {
  const { code, message, severity, context } = error

  // Create log message
  const logMessage = {
    timestamp: new Date().toISOString(),
    code,
    message,
    severity,
    context,
  }

  // Log based on severity
  switch (severity) {
    case "critical":
      console.error("CRITICAL ERROR:", logMessage)
      // In a real app, you might want to send this to a logging service
      // sendToLoggingService(logMessage, 'critical');
      break
    case "error":
      console.error("ERROR:", logMessage)
      break
    case "warning":
      console.warn("WARNING:", logMessage)
      break
    case "info":
      console.info("INFO:", logMessage)
      break
    default:
      console.log("LOG:", logMessage)
  }
}

// Function to check if the error is a network error
export function isNetworkError(error: any): boolean {
  if (!error) return false

  // Check error code
  if (
    error.code === "auth/network-request-failed" ||
    error.code === "firestore/unavailable" ||
    error.code === "network-error"
  ) {
    return true
  }

  // Check error message
  if (
    error.message &&
    (error.message.includes("network") ||
      error.message.includes("internet") ||
      error.message.includes("offline") ||
      error.message.includes("connection"))
  ) {
    return true
  }

  return false
}

// Function to check if the error is a permission error
export function isPermissionError(error: any): boolean {
  if (!error) return false

  return (
    error.code === "firestore/permission-denied" ||
    error.code === "storage/unauthorized" ||
    error.code === "auth/unauthorized"
  )
}

// Function to check if the error is a not-found error
export function isNotFoundError(error: any): boolean {
  if (!error) return false

  return error.code === "firestore/not-found" || error.code === "storage/object-not-found"
}

// Function to check if the error is a quota error
export function isQuotaError(error: any): boolean {
  if (!error) return false

  return (
    error.code === "firestore/resource-exhausted" ||
    error.code === "storage/quota-exceeded" ||
    error.code === "auth/quota-exceeded"
  )
}

// Function to check if the error is retryable
export function isRetryableError(error: any): boolean {
  if (!error) return false

  // Network errors are retryable
  if (isNetworkError(error)) return true

  // Some specific error codes are retryable
  const retryableCodes = [
    "firestore/unavailable",
    "firestore/aborted",
    "firestore/deadline-exceeded",
    "storage/retry-limit-exceeded",
    "timeout-error",
  ]

  return retryableCodes.includes(error.code)
}

// Function to retry an operation with exponential backoff
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 1000,
): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // Only retry if the error is retryable
      if (!isRetryableError(error)) {
        throw handleFirebaseError(error, { operation: "retry", additionalData: { attempt } })
      }

      // Calculate delay with exponential backoff and jitter
      const delay = initialDelayMs * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5)

      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // If we've exhausted all retries, throw the last error
  throw handleFirebaseError(lastError, {
    operation: "retry-exhausted",
    additionalData: { maxRetries },
  })
}
