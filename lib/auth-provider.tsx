"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "./auth-setup"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user)
        setLoading(false)
      },
      (error) => {
        console.error("Auth state error:", error)
        setError(error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Sign in error:", error)
      setError(error as Error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setError(null)
      const result = await createUserWithEmailAndPassword(auth, email, password)

      // Create user profile
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        email,
        displayName,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        onlineStatus: "online",
      })
    } catch (error) {
      console.error("Sign up error:", error)
      setError(error as Error)
      throw error
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
    } catch (error) {
      console.error("Sign out error:", error)
      setError(error as Error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
