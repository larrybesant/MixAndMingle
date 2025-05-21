"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { registerForPushNotifications, setupMessageListener } from "@/lib/client/notification-manager"
import { BellRing, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"

export function NotificationTest() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | "unknown">("unknown")
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<any | null>(null)

  // Check initial permission status
  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermissionStatus(Notification.permission)
    }
  }, [])

  // Set up message listener
  useEffect(() => {
    if (permissionStatus === "granted" && typeof window !== "undefined") {
      const setupListener = async () => {
        try {
          await setupMessageListener((payload) => {
            console.log("Received foreground message:", payload)
            setMessage(payload)
          })
        } catch (error) {
          console.error("Error setting up message listener:", error)
        }
      }

      setupListener()
    }
  }, [permissionStatus])

  const handleRequestPermission = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = await registerForPushNotifications()
      setFcmToken(token)
      setPermissionStatus(Notification.permission)
    } catch (error) {
      console.error("Error requesting permission:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          Notification Test
        </CardTitle>
        <CardDescription>Test Firebase Cloud Messaging push notifications</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Permission Status:</span>
          <PermissionBadge status={permissionStatus} />
        </div>

        {fcmToken && (
          <div className="space-y-2">
            <span className="font-medium">FCM Token:</span>
            <div className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
              <code>{fcmToken}</code>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>New Message Received</AlertTitle>
            <AlertDescription>
              {message.notification?.title}: {message.notification?.body}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleRequestPermission}
          disabled={loading || permissionStatus === "granted"}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : permissionStatus === "granted" ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Permission Granted
            </>
          ) : (
            <>
              <BellRing className="mr-2 h-4 w-4" />
              Request Notification Permission
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function PermissionBadge({ status }: { status: NotificationPermission | "unknown" }) {
  switch (status) {
    case "granted":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="mr-1 h-3 w-3" /> Granted
        </Badge>
      )
    case "denied":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="mr-1 h-3 w-3" /> Denied
        </Badge>
      )
    case "default":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <AlertTriangle className="mr-1 h-3 w-3" /> Not Decided
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Unknown
        </Badge>
      )
  }
}

export default NotificationTest
