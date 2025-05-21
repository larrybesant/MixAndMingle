"use client"

import { useState, useEffect } from "react"
import { goOnline, goOffline } from "@/lib/firebase-client-safe"

interface UseOnlineStatusReturn {
  isOnline: boolean
  lastOnline: Date | null
  setOfflineManually: () => Promise<void>
  setOnlineManually: () => Promise<void>
}

export function useOnlineStatus(): UseOnlineStatusReturn {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true)
  const [lastOnline, setLastOnline] = useState<Date | null>(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      goOnline().catch(console.error)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setLastOnline(new Date())
      // No need to call goOffline() here as Firebase will detect this automatically
    }

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)

      // Set initial state
      setIsOnline(navigator.onLine)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    }
  }, [])

  const setOfflineManually = async () => {
    try {
      await goOffline()
      setIsOnline(false)
      setLastOnline(new Date())
    } catch (error) {
      console.error("Error setting offline mode:", error)
    }
  }

  const setOnlineManually = async () => {
    try {
      await goOnline()
      setIsOnline(true)
    } catch (error) {
      console.error("Error setting online mode:", error)
    }
  }

  return {
    isOnline,
    lastOnline,
    setOfflineManually,
    setOnlineManually,
  }
}
