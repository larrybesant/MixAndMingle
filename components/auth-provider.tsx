"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getFirebaseAuth } from "@/lib/firebase/firebase-client"
import { type User, onAuthStateChanged } from "firebase/auth"

// Create auth context
interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

// Create hook for using auth context
export const useAuth = () => useContext(AuthContext)

// Create AuthProvider component
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getFirebaseAuth()

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    // Clean up subscription
    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}
