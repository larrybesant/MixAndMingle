"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { userPresence } from "@/lib/firebase/realtime-database"

export function useUserPresence() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Set up presence when the user logs in
    const cleanup = userPresence.connect(user.uid)

    // Clean up presence when the component unmounts
    return () => {
      cleanup()
      if (user) {
        userPresence.disconnect(user.uid)
      }
    }
  }, [user])
}
