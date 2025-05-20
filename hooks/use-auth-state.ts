"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase-client"
import type { AuthUser } from "./use-auth"

interface UseAuthStateReturn {
  user: AuthUser | null
  loading: boolean
}

export function useAuthState(): UseAuthStateReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", authUser.uid))

          if (userDoc.exists()) {
            const userData = userDoc.data()
            // Merge auth user with Firestore data
            setUser({
              ...authUser,
              isPremium: userData.isPremium,
              isVIP: userData.isVIP,
              role: userData.role,
              customData: userData,
            })
          } else {
            setUser(authUser)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUser(authUser)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}
