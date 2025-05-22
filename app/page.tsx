import { DJRoomsGrid } from "@/components/dj-rooms-grid"

// Initial data for server-side rendering
const initialRooms = [
  {
    id: "electronic",
    title: "Electronic Voyage",
    dj: "DJ Selectors",
    viewers: 120,
    isLive: true,
    imageUrl: "/images/rooms/electronic.png",
  },
  {
    id: "hiphop",
    title: "Hip Hop Grooves",
    dj: "DJ FreshBeats",
    viewers: 63,
    isLive: true,
    imageUrl: "/images/rooms/hiphop.png",
  },
  {
    id: "soul",
    title: "Soulful Sounds",
    dj: "DJ Harmony",
    viewers: 78,
    isLive: true,
    imageUrl: "/images/rooms/soul.png",
  },
]

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-6">Stream Live DJs</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Join live DJ sets from around the world. Chat and mingle with other music lovers.
        </p>

        <DJRoomsGrid initialRooms={initialRooms} />
      </section>
    </main>
  )
}
