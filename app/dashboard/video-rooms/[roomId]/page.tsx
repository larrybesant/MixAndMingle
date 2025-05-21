import { Suspense } from "react"
import { LazyVideoRoom, LazyVideoRoomParticipants } from "@/components/lazy"
import { Skeleton } from "@/components/ui/skeleton"

export default function VideoRoomPage({ params }: { params: { roomId: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Video Room: {params.roomId}</h1>

      <Suspense
        fallback={
          <div className="rounded-lg border p-8 text-center">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-8 w-48 mx-auto mt-4" />
          </div>
        }
      >
        <LazyVideoRoom roomId={params.roomId} />
      </Suspense>

      <h2 className="text-2xl font-semibold mt-8">Participants</h2>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Skeleton className="aspect-video rounded-lg" />
            <Skeleton className="aspect-video rounded-lg" />
            <Skeleton className="aspect-video rounded-lg" />
            <Skeleton className="aspect-video rounded-lg" />
          </div>
        }
      >
        <LazyVideoRoomParticipants roomId={params.roomId} />
      </Suspense>
    </div>
  )
}
