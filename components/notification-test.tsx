"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface NotificationTestProps {
  userId: string
}

export function NotificationTest({ userId }: NotificationTestProps) {
  const [title, setTitle] = useState("Test Notification")
  const [body, setBody] = useState("This is a test notification from Mix & Mingle")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleSendTest = async () => {
    setIsSending(true)

    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          title,
          body,
          data: {
            type: "test",
            timestamp: new Date().toISOString(),
          },
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Test notification sent",
          description: `Success: ${result.results.success}, Failure: ${result.results.failure}`,
        })
      } else {
        throw new Error(result.error || "Failed to send test notification")
      }
    } catch (error) {
      console.error("Error sending test notification:", error)
      toast({
        variant: "destructive",
        title: "Error sending notification",
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Notifications</CardTitle>
        <CardDescription>Send a test notification to your devices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Notification Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notification title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body">Notification Body</Label>
          <Input
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter notification message"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSendTest} disabled={isSending}>
          {isSending ? "Sending..." : "Send Test Notification"}
        </Button>
      </CardFooter>
    </Card>
  )
}
