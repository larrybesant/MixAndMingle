"use client"

import { useState, useCallback } from "react"
import { sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"
import { auth } from "@/lib/firebase-client-safe"

interface UsePasswordResetReturn {
  loading: boolean
  error: Error | null
  sendResetEmail: (email: string) => Promise<void>
  confirmReset: (code: string, newPassword: string) => Promise<void>
  verifyResetCode: (code: string) => Promise<string>
}

export function usePasswordReset(): UsePasswordResetReturn {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const sendResetEmail = useCallback(async (email: string) => {
    setLoading(true)
    setError(null)
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`, // Redirect URL after password reset
        handleCodeInApp: false,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to send password reset email"))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const confirmReset = useCallback(async (code: string, newPassword: string) => {
    setLoading(true)
    setError(null)
    try {
      await confirmPasswordReset(auth, code, newPassword)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to reset password"))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyResetCode = useCallback(async (code: string) => {
    setLoading(true)
    setError(null)
    try {
      return await verifyPasswordResetCode(auth, code)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Invalid or expired password reset code"))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    sendResetEmail,
    confirmReset,
    verifyResetCode,
  }
}
