"use client"

import type React from "react"
import { createContext, useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"

type AuthContextType = {
  user: User | null
  loading: boolean
  error: Error | null
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let unsubscribe = () => {}

    try {
      // Check if auth is properly initialized
      if (auth && typeof auth.onAuthStateChanged === "function") {
        const authStateChanged = onAuthStateChanged(
          auth,
          (user) => {
            setUser(user)
            setLoading(false)
          },
          (error) => {
            console.error("Auth state change error:", error)
            setError(error)
            setLoading(false)
          },
        )

        unsubscribe = authStateChanged
      } else {
        // If auth is not properly initialized, set loading to false
        console.warn("Auth not properly initialized, using development mode")
        setLoading(false)

        // In development, we can set a mock user
        if (process.env.NODE_ENV === "development") {
          setUser({
            uid: "dev-user-123",
            email: "dev@example.com",
            displayName: "Development User",
            photoURL: "/abstract-geometric-shapes.png",
            emailVerified: true,
          } as User)
        }
      }
    } catch (err) {
      console.error("Error setting up auth listener:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      setLoading(false)
    }

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe()
      }
    }
  }, [])

  return <AuthContext.Provider value={{ user, loading, error }}>{children}</AuthContext.Provider>
}
