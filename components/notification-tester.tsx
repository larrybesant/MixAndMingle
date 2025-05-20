"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { NotificationApi } from "@/lib/client/notification-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

export function NotificationTester() {
  const { user } = useAuth()
  const [notificationType, setNotificationType] = useState("system")
  const [title, setTitle] = useState("Test Notification")
  const [body, setBody] = useState("This is a test notification")
  const [loading, setLoading] = useState(false)

  const sendTestNotification = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to send test notifications",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const result = await NotificationApi.sendNotification(user.uid, notificationType, title, body, { test: true })

      toast({
        title: "Notification Sent",
        description: "Test notification was sent successfully",
      })

      console.log("Notification result:", result)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      })

      console.error("Error sending test notification:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Tester</CardTitle>
          <CardDescription>You must be logged in to use this feature</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Tester</CardTitle>
        <CardDescription>Send test notifications to yourself</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="notification-type" className="text-sm font-medium">
            Notification Type
          </label>
          <Select value={notificationType} onValueChange={setNotificationType}>
            <SelectTrigger id="notification-type">
              <SelectValue placeholder="Select notification type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="message">Message</SelectItem>
              <SelectItem value="mention">Mention</SelectItem>
              <SelectItem value="roomInvite">Room Invite</SelectItem>
              <SelectItem value="friendRequest">Friend Request</SelectItem>
              <SelectItem value="gift">Gift</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="notification-title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="notification-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="notification-body" className="text-sm font-medium">
            Body
          </label>
          <Textarea
            id="notification-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Notification body"
            rows={3}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={sendTestNotification} disabled={loading || !title || !body}>
          {loading ? "Sending..." : "Send Test Notification"}
        </Button>
      </CardFooter>
    </Card>
  )
}
