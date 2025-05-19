"use client"

import type React from "react"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { updateNotificationPreferences } from "./actions"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface NotificationPreferencesFormProps {
  initialEmailNotifications: boolean
  initialPushNotifications: boolean
}

export function NotificationPreferencesForm({
  initialEmailNotifications,
  initialPushNotifications,
}: NotificationPreferencesFormProps) {
  const [emailNotifications, setEmailNotifications] = useState(initialEmailNotifications)
  const [pushNotifications, setPushNotifications] = useState(initialPushNotifications)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await updateNotificationPreferences({
        emailNotifications,
        pushNotifications,
      })

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Preferences Updated",
          description: "Your notification preferences have been saved.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Delivery Methods</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
            </div>
            <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Types</h3>
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Event Invitations</Label>
                <p className="text-sm text-muted-foreground">When someone invites you to an event</p>
              </div>
              <Switch checked={true} disabled />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Event Reminders</Label>
                <p className="text-sm text-muted-foreground">Reminders for upcoming events you're attending</p>
              </div>
              <Switch checked={true} disabled />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Live Stream Notifications</Label>
                <p className="text-sm text-muted-foreground">When DJs you follow start a live stream</p>
              </div>
              <Switch checked={true} disabled />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Direct Messages</Label>
                <p className="text-sm text-muted-foreground">When you receive a new direct message</p>
              </div>
              <Switch checked={true} disabled />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Note: Some notifications are required and cannot be disabled.
          </p>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </form>
  )
}
