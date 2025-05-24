import DashboardLayout from "@/components/dashboard/dashboard-layout"
import VideoRooms from "@/components/video/video-rooms"
import ProtectedRoute from "@/components/protected-route"

export default function VideoPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <VideoRooms />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
