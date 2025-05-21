import { LazyVideoRoom } from "@/components/lazy"

export default function VideoRoomPage({ params }: { params: { roomId: string } }) {
  return <LazyVideoRoom roomId={params.roomId} />
}
