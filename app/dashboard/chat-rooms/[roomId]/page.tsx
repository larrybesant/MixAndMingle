import { Suspense } from "react"
import { LazyEnhancedChatRoom, LazyEmojiPicker } from "@/components/lazy"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChatRoomPage({ params }: { params: { roomId: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Chat Room: {params.roomId}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Suspense
            fallback={
              <div className="rounded-lg border p-4">
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            }
          >
            <LazyEnhancedChatRoom roomId={params.roomId} />
          </Suspense>
        </div>

        <div className="md:col-span-1">
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Emoji Reactions</h2>
            <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-lg" />}>
              <LazyEmojiPicker roomId={params.roomId} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
