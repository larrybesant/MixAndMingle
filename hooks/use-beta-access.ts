"use client"

import { useState, useEffect } from "react"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { useAuth } from "@/lib/auth/auth-context"

export function useBetaAccess() {
  const { user } = useAuth()
  const [hasBetaAccess, setHasBetaAccess] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function checkBetaAccess() {
      if (!user) {
        setHasBetaAccess(false)
        setIsLoading(false)
        return
      }

      try {
        const db = getFirestore()
        const userDoc = await getDoc(doc(db, "users", user.uid))

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setHasBetaAccess(userData.isBetaTester === true)
        } else {
          setHasBetaAccess(false)
        }
      } catch (err) {
        console.error("Error checking beta access:", err)
        setError(err instanceof Error ? err : new Error("Failed to check beta access"))
        setHasBetaAccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkBetaAccess()
  }, [user])

  return { hasBetaAccess, isLoading, error }
}
