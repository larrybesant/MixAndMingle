import DashboardLayout from "@/components/dashboard/dashboard-layout"
import ChatRooms from "@/components/chat/chat-rooms"
import ProtectedRoute from "@/components/protected-route"

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ChatRooms />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
