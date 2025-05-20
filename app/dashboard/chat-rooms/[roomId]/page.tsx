import { Suspense } from "react"
import { ChatRoom } from "@/components/chat-room"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChatRoomPage({ params }: { params: { roomId: string } }) {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <Suspense fallback={<ChatRoomSkeleton />}>
        <ChatRoom roomId={params.roomId} />
      </Suspense>
    </div>
  )
}

function ChatRoomSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <Skeleton className="h-6 w-[200px]" />
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-start gap-4 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-16 w-[300px] rounded-lg" />
              </div>
            </div>
          ))}
      </div>
      <div className="border-t p-4">
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  )
}
