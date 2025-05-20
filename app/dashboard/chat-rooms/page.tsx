import { Suspense } from "react"
import { ChatRoomsList } from "@/components/chat-rooms-list"
import { CreateChatRoomButton } from "@/components/create-chat-room-button"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChatRoomsPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chat Rooms</h1>
        <CreateChatRoomButton />
      </div>
      <Suspense fallback={<ChatRoomsSkeleton />}>
        <ChatRoomsList />
      </Suspense>
    </div>
  )
}

function ChatRoomsSkeleton() {
  return (
    <div className="space-y-4">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-5 w-[200px]" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-[80px]" />
                <Skeleton className="h-6 w-[80px]" />
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}
