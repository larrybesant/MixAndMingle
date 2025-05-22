"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BellIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirebaseMessaging } from "@/hooks/use-firebase-messaging"

interface NotificationPermissionProps {
  userId: string
}

export function NotificationPermission({ userId }: NotificationPermissionProps) {
  const { toast } = useToast()
  const [isRegistering, setIsRegistering] = useState(false)

  const { permission, loading, error, requestPermission, token, isSupported } = useFirebaseMessaging({
    onTokenReceived: (token) => {
      // Register token with user
      registerToken(userId, token)
    },
    onMessage: (payload) => {
      // Handle foreground messages
      toast({
        title: payload.notification?.title || "New notification",
        description: payload.notification?.body,
      })
    },
  })

  // Register token with user
  const registerToken = async (userId: string, token: string) => {
    setIsRegistering(true)

    try {
      const response = await fetch("/api/notifications/register-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          token,
          platform: /iPhone|iPad|iPod/.test(navigator.userAgent) ? "ios" : "web",
        }),
      })

      if (response.ok) {
        toast({
          title: "Notifications enabled",
          description: "You will now receive notifications from Mix & Mingle",
        })
      } else {
        throw new Error("Failed to register notification token")
      }
    } catch (error) {
      console.error("Error registering notification token:", error)
      toast({
        variant: "destructive",
        title: "Error enabling notifications",
        description: "Please try again later",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  if (!isSupported) {
    return null
  }

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-2 p-2 text-sm text-green-700 bg-green-50 rounded-md">
        <CheckCircle2Icon className="w-4 h-4" />
        <span>Notifications enabled</span>
      </div>
    )
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2 p-2 text-sm text-red-700 bg-red-50 rounded-md">
        <XCircleIcon className="w-4 h-4" />
        <span>Notifications blocked. Please enable them in your browser settings.</span>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      onClick={requestPermission}
      disabled={loading || isRegistering}
    >
      <BellIcon className="w-4 h-4" />
      {loading || isRegistering ? "Enabling notifications..." : "Enable notifications"}
    </Button>
  )
}
