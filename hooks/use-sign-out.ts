"use client"

import { useState, useCallback } from "react"
import { signOut as firebaseSignOut } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase-client"
import { useAuthState } from "./use-auth-state"

interface UseSignOutReturn {
  loading: boolean
  error: Error | null
  signOut: () => Promise<void>
}

export function useSignOut(): UseSignOutReturn {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuthState()

  const signOut = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Update online status before signing out
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          onlineStatus: "offline",
          lastActive: new Date().toISOString(),
        })
      }

      await firebaseSignOut(auth)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign out"))
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  return {
    loading,
    error,
    signOut,
  }
}
