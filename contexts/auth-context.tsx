"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { getUserData, type UserData } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  error: string | null
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  error: null,
  refreshUserData: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUserData = async () => {
    if (user) {
      try {
        const data = await getUserData(user.uid)
        setUserData(data)
        setError(null)
      } catch (err) {
        console.error("Error refreshing user data:", err)
        setError("Failed to load user data")
      }
    }
  }

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const initializeAuth = async () => {
      try {
        // Dynamically import auth to ensure Firebase is initialized
        const { auth } = await import("@/lib/firebase")

        unsubscribe = onAuthStateChanged(auth, async (user) => {
          setUser(user)
          setError(null)

          if (user) {
            try {
              const data = await getUserData(user.uid)
              setUserData(data)
            } catch (err) {
              console.error("Error loading user data:", err)
              setError("Failed to load user profile")
              setUserData(null)
            }
          } else {
            setUserData(null)
          }

          setLoading(false)
        })
      } catch (err) {
        console.error("Firebase initialization error:", err)
        setError("Failed to initialize authentication")
        setLoading(false)
      }
    }

    initializeAuth()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const value = {
    user,
    userData,
    loading,
    error,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
