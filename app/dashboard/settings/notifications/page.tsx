"use client"

import { NotificationSettings } from "@/components/notification-settings"
import { NotificationSoundSettings } from "@/components/notification-sound-settings"

export default function NotificationsSettingsPage() {
  return (
    <div className="container py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
        <p className="text-muted-foreground">
          Manage your notification preferences and customize how you receive alerts.
        </p>
      </div>

      <div className="grid gap-8">
        <NotificationSettings />
        <NotificationSoundSettings />
      </div>
    </div>
  )
}
