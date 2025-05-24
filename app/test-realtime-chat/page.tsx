import DashboardLayout from "@/components/dashboard/dashboard-layout"
import RealTimeChatTest from "@/components/chat/real-time-chat-test"
import ProtectedRoute from "@/components/protected-route"

export default function TestRealTimeChatPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <RealTimeChatTest />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
