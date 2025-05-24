import DashboardLayout from "@/components/dashboard/dashboard-layout"
import UserSettings from "@/components/settings/user-settings"
import ProtectedRoute from "@/components/protected-route"

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <UserSettings />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
