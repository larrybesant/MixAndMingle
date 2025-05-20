"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase-browser"

export interface AuthUser extends User {
  customData?: Record<string, any>
}

export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (authUser) => {
        try {
          if (authUser) {
            // Fetch additional user data from Firestore
            const userDoc = await getDoc(doc(db, "users", authUser.uid))
            const customData = userDoc.exists() ? userDoc.data() : {}

            const enhancedUser = authUser as AuthUser
            enhancedUser.customData = customData

            setUser(enhancedUser)
          } else {
            setUser(null)
          }
        } catch (err) {
          console.error("Error in auth state change:", err)
          setError(err instanceof Error ? err : new Error("An unknown error occurred"))
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        console.error("Auth state error:", err)
        setError(err)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  return { user, loading, error }
}
