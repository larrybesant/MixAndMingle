import { NotificationSettings } from "@/components/notification-settings"

export default function SettingsPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-8">
        <NotificationSettings />

        {/* Other settings sections can be added here */}
      </div>
    </div>
  )
}
