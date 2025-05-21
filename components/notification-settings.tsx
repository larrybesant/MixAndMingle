"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BellIcon, MessageCircleIcon, UserPlusIcon, GiftIcon, MusicIcon, InfoIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface NotificationSetting {
  id: string
  name: string
  description: string
  enabled: boolean
  icon: React.ReactNode
  category: "push" | "email" | "sound"
}

// Named export for the NotificationSettings component
export function NotificationSettings() {
  // Initial notification settings
  const [pushNotifications, setPushNotifications] = useState<NotificationSetting[]>([
    {
      id: "new-message",
      name: "New Messages",
      description: "Receive notifications when you get new messages",
      enabled: true,
      icon: <MessageCircleIcon className="h-4 w-4" />,
      category: "push",
    },
    {
      id: "friend-request",
      name: "Friend Requests",
      description: "Receive notifications for new friend requests",
      enabled: true,
      icon: <UserPlusIcon className="h-4 w-4" />,
      category: "push",
    },
    {
      id: "room-invite",
      name: "Room Invites",
      description: "Receive notifications when invited to a room",
      enabled: true,
      icon: <MusicIcon className="h-4 w-4" />,
      category: "push",
    },
    {
      id: "gift-received",
      name: "Virtual Gifts",
      description: "Receive notifications when someone sends you a gift",
      enabled: true,
      icon: <GiftIcon className="h-4 w-4" />,
      category: "push",
    },
    {
      id: "system-notification",
      name: "System Notifications",
      description: "Important updates about Mix & Mingle",
      enabled: true,
      icon: <InfoIcon className="h-4 w-4" />,
      category: "push",
    },
  ])

  const [emailNotifications, setEmailNotifications] = useState<NotificationSetting[]>([
    {
      id: "email-message",
      name: "Message Digests",
      description: "Receive a daily digest of unread messages",
      enabled: false,
      icon: <MessageCircleIcon className="h-4 w-4" />,
      category: "email",
    },
    {
      id: "email-friend",
      name: "Friend Activity",
      description: "Updates about your friends' activity",
      enabled: true,
      icon: <UserPlusIcon className="h-4 w-4" />,
      category: "email",
    },
    {
      id: "email-events",
      name: "Upcoming Events",
      description: "Notifications about upcoming DJ sessions and events",
      enabled: true,
      icon: <MusicIcon className="h-4 w-4" />,
      category: "email",
    },
    {
      id: "email-newsletter",
      name: "Newsletter",
      description: "Monthly newsletter with platform updates",
      enabled: false,
      icon: <InfoIcon className="h-4 w-4" />,
      category: "email",
    },
  ])

  const [soundNotifications, setSoundNotifications] = useState<NotificationSetting[]>([
    {
      id: "sound-message",
      name: "Message Sound",
      description: "Play a sound when you receive a new message",
      enabled: true,
      icon: <MessageCircleIcon className="h-4 w-4" />,
      category: "sound",
    },
    {
      id: "sound-friend",
      name: "Friend Request Sound",
      description: "Play a sound for new friend requests",
      enabled: true,
      icon: <UserPlusIcon className="h-4 w-4" />,
      category: "sound",
    },
    {
      id: "sound-room",
      name: "Room Invite Sound",
      description: "Play a sound when invited to a room",
      enabled: true,
      icon: <MusicIcon className="h-4 w-4" />,
      category: "sound",
    },
    {
      id: "sound-gift",
      name: "Gift Sound",
      description: "Play a sound when receiving a virtual gift",
      enabled: true,
      icon: <GiftIcon className="h-4 w-4" />,
      category: "sound",
    },
  ])

  // Toggle notification setting
  const toggleNotification = (id: string, category: "push" | "email" | "sound") => {
    if (category === "push") {
      setPushNotifications((prev) =>
        prev.map((setting) => (setting.id === id ? { ...setting, enabled: !setting.enabled } : setting)),
      )
    } else if (category === "email") {
      setEmailNotifications((prev) =>
        prev.map((setting) => (setting.id === id ? { ...setting, enabled: !setting.enabled } : setting)),
      )
    } else if (category === "sound") {
      setSoundNotifications((prev) =>
        prev.map((setting) => (setting.id === id ? { ...setting, enabled: !setting.enabled } : setting)),
      )
    }
  }

  // Save notification settings
  const saveSettings = () => {
    // In a real app, you would save these settings to your backend
    // For now, we'll just show a success toast
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated.",
    })
  }

  // Reset notification settings to default
  const resetToDefault = () => {
    setPushNotifications((prev) => prev.map((setting) => ({ ...setting, enabled: true })))
    setEmailNotifications((prev) =>
      prev.map((setting) => ({ ...setting, enabled: setting.id.includes("newsletter") ? false : true })),
    )
    setSoundNotifications((prev) => prev.map((setting) => ({ ...setting, enabled: true })))

    toast({
      title: "Settings reset",
      description: "Your notification settings have been reset to default.",
    })
  }

  // Render notification setting item
  const renderNotificationItem = (setting: NotificationSetting) => (
    <div key={setting.id} className="flex items-center justify-between py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 bg-primary/10 p-2 rounded-full">{setting.icon}</div>
        <div>
          <Label htmlFor={setting.id} className="font-medium">
            {setting.name}
          </Label>
          <p className="text-sm text-gray-500">{setting.description}</p>
        </div>
      </div>
      <Switch
        id={setting.id}
        checked={setting.enabled}
        onCheckedChange={() => toggleNotification(setting.id, setting.category)}
      />
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BellIcon className="h-5 w-5" />
          <CardTitle>Notification Settings</CardTitle>
        </div>
        <CardDescription>Manage how you receive notifications from Mix & Mingle</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="push">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="push">Push Notifications</TabsTrigger>
            <TabsTrigger value="email">Email Notifications</TabsTrigger>
            <TabsTrigger value="sound">Sound Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="push" className="mt-4">
            <div className="space-y-1 divide-y">{pushNotifications.map(renderNotificationItem)}</div>
          </TabsContent>

          <TabsContent value="email" className="mt-4">
            <div className="space-y-1 divide-y">{emailNotifications.map(renderNotificationItem)}</div>
          </TabsContent>

          <TabsContent value="sound" className="mt-4">
            <div className="space-y-1 divide-y">{soundNotifications.map(renderNotificationItem)}</div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={resetToDefault}>
            Reset to Default
          </Button>
          <Button onClick={saveSettings}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Also export as default for flexibility
export default NotificationSettings
