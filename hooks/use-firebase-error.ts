"use client"

import { useState, useCallback } from "react"
import { type FirebaseError, handleFirebaseError, type ErrorContext } from "@/lib/firebase-error-handler"
import { useToast } from "@/hooks/use-toast"

interface UseFirebaseErrorOptions {
  showToast?: boolean
  logError?: boolean
}

export function useFirebaseError(options: UseFirebaseErrorOptions = {}) {
  const { showToast = true, logError = true } = options
  const [error, setError] = useState<FirebaseError | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const { toast } = useToast()

  const handleError = useCallback(
    (err: any, context?: ErrorContext) => {
      const firebaseError = handleFirebaseError(err, context)

      // Set the error state
      setError(firebaseError)

      // Show toast if enabled
      if (showToast) {
        toast({
          title:
            firebaseError.severity === "critical" || firebaseError.severity === "error"
              ? "Error"
              : firebaseError.severity === "warning"
                ? "Warning"
                : "Notice",
          description: firebaseError.userMessage,
          variant:
            firebaseError.severity === "critical" || firebaseError.severity === "error"
              ? "destructive"
              : firebaseError.severity === "warning"
                ? "warning"
                : "default",
          duration: 5000,
        })
      }

      return firebaseError
    },
    [showToast, toast],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Fixed wrapAsync implementation
  const wrapAsync = useCallback(
    async <T,>(asyncFn: () => Promise<T>, context?: ErrorContext): Promise<T> => {
      setLoading(true)
      clearError()

      try {
        return await asyncFn()
      } catch (err) {
        handleError(err, context)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [handleError, clearError],
  )

  return {
    error,
    loading,
    handleError,
    clearError,
    wrapAsync,
  }
}
