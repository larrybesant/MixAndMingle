"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notification-context"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Bell } from "lucide-react"

interface NotificationPreferences {
  pushEnabled: boolean
  emailEnabled: boolean
  chatNotifications: boolean
  mentionNotifications: boolean
  roomInviteNotifications: boolean
  friendRequestNotifications: boolean
  giftNotifications: boolean
  systemNotifications: boolean
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    pushEnabled: false,
    emailEnabled: false,
    chatNotifications: true,
    mentionNotifications: true,
    roomInviteNotifications: true,
    friendRequestNotifications: true,
    giftNotifications: true,
    systemNotifications: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { user } = useAuth()
  const { requestPushPermission } = useNotifications()
  const { toast } = useToast()

  // Load user's notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))

        if (userDoc.exists()) {
          const userData = userDoc.data()

          if (userData.notificationPreferences) {
            setPreferences({
              ...preferences,
              ...userData.notificationPreferences,
            })
          }
        }
      } catch (error) {
        console.error("Error loading notification preferences:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load notification preferences.",
        })
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [user, toast])

  // Save notification preferences
  const savePreferences = async () => {
    if (!user) return

    setSaving(true)

    try {
      await updateDoc(doc(db, "users", user.uid), {
        notificationPreferences: preferences,
      })

      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
      })
    } catch (error) {
      console.error("Error saving notification preferences:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save notification preferences.",
      })
    } finally {
      setSaving(false)
    }
  }

  // Enable push notifications
  const enablePushNotifications = async () => {
    const granted = await requestPushPermission()

    if (granted) {
      setPreferences({
        ...preferences,
        pushEnabled: true,
      })

      toast({
        title: "Push notifications enabled",
        description: "You will now receive push notifications.",
      })
    } else {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Please enable notifications in your browser settings.",
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-40">Loading preferences...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage how and when you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Channels</h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on your device even when the app is closed
                </p>
              </div>
              {preferences.pushEnabled ? (
                <Switch
                  id="push-notifications"
                  checked={preferences.pushEnabled}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, pushEnabled: checked })}
                />
              ) : (
                <Button onClick={enablePushNotifications} size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Enable
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive important notifications via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.emailEnabled}
                onCheckedChange={(checked) => setPreferences({ ...preferences, emailEnabled: checked })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Types</h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="chat-notifications">Chat Messages</Label>
                <p className="text-sm text-muted-foreground">Notifications for new messages in your chat rooms</p>
              </div>
              <Switch
                id="chat-notifications"
                checked={preferences.chatNotifications}
                onCheckedChange={(checked) => setPreferences({ ...preferences, chatNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mention-notifications">Mentions</Label>
                <p className="text-sm text-muted-foreground">Notifications when someone mentions you in a chat</p>
              </div>
              <Switch
                id="mention-notifications"
                checked={preferences.mentionNotifications}
                onCheckedChange={(checked) => setPreferences({ ...preferences, mentionNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="room-invite-notifications">Room Invites</Label>
                <p className="text-sm text-muted-foreground">Notifications when you're invited to a new room</p>
              </div>
              <Switch
                id="room-invite-notifications"
                checked={preferences.roomInviteNotifications}
                onCheckedChange={(checked) => setPreferences({ ...preferences, roomInviteNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="friend-request-notifications">Friend Requests</Label>
                <p className="text-sm text-muted-foreground">Notifications for new friend requests</p>
              </div>
              <Switch
                id="friend-request-notifications"
                checked={preferences.friendRequestNotifications}
                onCheckedChange={(checked) => setPreferences({ ...preferences, friendRequestNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="gift-notifications">Gifts</Label>
                <p className="text-sm text-muted-foreground">Notifications when you receive virtual gifts</p>
              </div>
              <Switch
                id="gift-notifications"
                checked={preferences.giftNotifications}
                onCheckedChange={(checked) => setPreferences({ ...preferences, giftNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-notifications">System Notifications</Label>
                <p className="text-sm text-muted-foreground">Important updates about your account and the platform</p>
              </div>
              <Switch
                id="system-notifications"
                checked={preferences.systemNotifications}
                onCheckedChange={(checked) => setPreferences({ ...preferences, systemNotifications: checked })}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardFooter>
    </Card>
  )
}
