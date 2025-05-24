import DashboardLayout from "@/components/dashboard/dashboard-layout"
import UserProfile from "@/components/profile/user-profile"
import ProtectedRoute from "@/components/protected-route"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <UserProfile />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
