import { Suspense } from "react"
import { VideoRoomEnhanced } from "@/components/video-room-enhanced"
import { Skeleton } from "@/components/ui/skeleton"

export default function VideoRoomPage({ params }: { params: { roomId: string } }) {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <Suspense fallback={<VideoRoomSkeleton />}>
        <VideoRoomEnhanced roomId={params.roomId} />
      </Suspense>
    </div>
  )
}

function VideoRoomSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <Skeleton className="h-6 w-[200px]" />
      </div>
      <div className="flex-1 grid place-items-center">
        <Skeleton className="h-[400px] w-[600px] rounded-lg" />
      </div>
    </div>
  )
}
