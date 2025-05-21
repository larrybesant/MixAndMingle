import { LazyEnhancedChatRoom } from "@/components/lazy"

export default function ChatRoomPage({ params }: { params: { roomId: string } }) {
  return <LazyEnhancedChatRoom roomId={params.roomId} />
}
