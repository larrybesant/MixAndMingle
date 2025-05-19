import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Users, Clock } from "lucide-react"
import Link from "next/link"

export function UpcomingStreams() {
  // This would normally be fetched from an API
  const upcomingStreams = [
    {
      id: "stream1",
      title: "Deep House Vibes",
      dj: "DJ Alex",
      image: "/dj-stream-1.png",
      genre: "Deep House",
      startTime: "Today, 8:00 PM",
      listeners: 245,
    },
    {
      id: "stream2",
      title: "Techno Tuesday",
      dj: "DJ Maya",
      image: "/dj-stream-2.png",
      genre: "Techno",
      startTime: "Tomorrow, 9:00 PM",
      listeners: 189,
    },
    {
      id: "stream3",
      title: "Chill Lofi Beats",
      dj: "DJ Kai",
      image: "/dj-stream-3.png",
      genre: "Lo-Fi",
      startTime: "Wed, 7:30 PM",
      listeners: 312,
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-950">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl">Upcoming Live Streams</h2>
            <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join these upcoming DJ sets and connect with other music lovers
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {upcomingStreams.map((stream) => (
            <Card key={stream.id} className="overflow-hidden bg-gray-900 border-gray-800">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={stream.image || "/placeholder.svg"}
                  alt={stream.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
                <Badge className="absolute top-2 right-2 bg-blue-600">{stream.genre}</Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-bold text-white mb-1">{stream.title}</h3>
                <p className="text-gray-400 mb-3">by {stream.dj}</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{stream.startTime}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{stream.listeners}</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href={`/streams/${stream.id}`}>
                    <Play className="h-4 w-4 mr-2" /> Join Stream
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="border-blue-600 text-blue-500 hover:bg-blue-950" asChild>
            <Link href="/streams">View All Streams</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
