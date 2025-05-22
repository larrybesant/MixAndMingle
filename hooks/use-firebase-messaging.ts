"use client"

import { useState, useEffect, useCallback } from "react"
import { requestNotificationPermission, setupMessageListener } from "@/lib/firebase/firebase-client"

interface UseFirebaseMessagingProps {
  onMessage?: (payload: any) => void
  onTokenReceived?: (token: string) => void
}

export function useFirebaseMessaging({ onMessage, onTokenReceived }: UseFirebaseMessagingProps = {}) {
  const [token, setToken] = useState<string | null>(null)
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check initial permission status
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported")
      return
    }

    setPermission(Notification.permission as NotificationPermission)
  }, [])

  // Request permission and get token
  const requestPermission = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const fcmToken = await requestNotificationPermission()

      if (fcmToken) {
        setToken(fcmToken)
        setPermission("granted")
        if (onTokenReceived) {
          onTokenReceived(fcmToken)
        }
      } else {
        setPermission(Notification.permission as NotificationPermission)
        if (Notification.permission === "denied") {
          setError("Notification permission denied")
        }
      }
    } catch (err: any) {
      console.error("Error requesting permission:", err)
      setError(err.message || "Failed to request notification permission")
    } finally {
      setLoading(false)
    }
  }, [onTokenReceived])

  // Set up message listener
  useEffect(() => {
    if (!onMessage || permission !== "granted") return

    const unsubscribe = setupMessageListener(onMessage)
    return () => unsubscribe()
  }, [permission, onMessage])

  return {
    token,
    permission,
    loading,
    error,
    requestPermission,
    isSupported: permission !== "unsupported",
  }
}
