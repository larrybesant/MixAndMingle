import { Suspense } from "react"
import { RoomSkeleton } from "@/components/room-skeleton"
import RoomContent from "./room-content"

// This would typically come from your database
const mockRooms = [
  {
    id: "electronic",
    title: "Electronic Voyage",
    dj: "selectors",
    viewers: 120,
    isLive: true,
    imageUrl: "/images/rooms/electronic.jpg",
    description: "Join us for the best electronic music from around the world.",
  },
  {
    id: "hiphop",
    title: "Hip Hop Grooves",
    dj: "DJ FreshBeats",
    viewers: 63,
    isLive: true,
    imageUrl: "/images/rooms/hiphop.jpg",
    description: "The freshest hip hop beats and classic tracks all night long.",
  },
  {
    id: "soul",
    title: "Soulful Sounds",
    dj: "DJ Harmony",
    viewers: 78,
    isLive: true,
    imageUrl: "/images/rooms/soul.jpg",
    description: "Smooth soul and R&B to soothe your spirit.",
  },
]

export default function RoomPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<RoomSkeleton />}>
        <RoomContent id={params.id} />
      </Suspense>
    </div>
  )
}
