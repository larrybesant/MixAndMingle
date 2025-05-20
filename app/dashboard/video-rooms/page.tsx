import { Suspense } from "react"
import { VideoRoomsList } from "@/components/video-rooms-list"
import { CreateVideoRoomButton } from "@/components/create-video-room-button"
import { Skeleton } from "@/components/ui/skeleton"

export default function VideoRoomsPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Video Rooms</h1>
        <CreateVideoRoomButton />
      </div>
      <Suspense fallback={<VideoRoomsSkeleton />}>
        <VideoRoomsList />
      </Suspense>
    </div>
  )
}

function VideoRoomsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="rounded-lg border">
            <Skeleton className="aspect-video w-full rounded-t-lg" />
            <div className="p-4">
              <Skeleton className="h-6 w-[80%] mb-2" />
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center justify-between mt-4">
                <Skeleton className="h-6 w-[80px]" />
                <Skeleton className="h-9 w-[80px]" />
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}
