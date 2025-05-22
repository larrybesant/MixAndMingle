"use client"

import { createContext, useState, useEffect, useContext, type ReactNode } from "react"
import type { User } from "firebase/auth"
import {
  initializeFirebase,
  subscribeToAuthChanges,
  signIn,
  signUp,
  logOut,
  resetPassword,
  verifyAuthConfig,
} from "@/lib/firebase/firebase-auth"

// Initialize Firebase
initializeFirebase()

// Verify auth configuration on startup
verifyAuthConfig()

interface AuthContextProps {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: any }>
  logOut: () => Promise<{ success: boolean; error: any }>
  resetPassword: (email: string) => Promise<{ success: boolean; error: any }>
  clearError: () => void
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => ({ user: null, error: null }),
  signUp: async () => ({ user: null, error: null }),
  logOut: async () => ({ success: false, error: null }),
  resetPassword: async () => ({ success: false, error: null }),
  clearError: () => {},
})

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const handleSignIn = async (email: string, password: string) => {
    setError(null)
    const result = await signIn(email, password)
    if (result.error) {
      setError(result.error.message)
    }
    return result
  }

  const handleSignUp = async (email: string, password: string) => {
    setError(null)
    const result = await signUp(email, password)
    if (result.error) {
      setError(result.error.message)
    }
    return result
  }

  const handleLogOut = async () => {
    setError(null)
    const result = await logOut()
    if (result.error) {
      setError(result.error.message)
    }
    return result
  }

  const handleResetPassword = async (email: string) => {
    setError(null)
    const result = await resetPassword(email)
    if (result.error) {
      setError(result.error.message)
    }
    return result
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn: handleSignIn,
        signUp: handleSignUp,
        logOut: handleLogOut,
        resetPassword: handleResetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
