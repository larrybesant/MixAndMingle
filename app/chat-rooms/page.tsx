import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users, Filter } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ChatRoomsPage() {
  // This would normally be fetched from an API
  const chatRooms = [
    {
      id: "room1",
      name: "Deep House Lounge",
      description: "Discuss deep house music and share your favorite tracks",
      image: "/chat-room-1.png",
      category: "Music",
      activeUsers: 42,
      tags: ["Deep House", "Electronic", "Music"],
    },
    {
      id: "room2",
      name: "Music Producers Hub",
      description: "Connect with other music producers and share tips",
      image: "/chat-room-2.png",
      category: "Production",
      activeUsers: 28,
      tags: ["Production", "Music", "Tips"],
    },
    {
      id: "room3",
      name: "Vinyl Collectors",
      description: "For vinyl enthusiasts to discuss collections and finds",
      image: "/chat-room-3.png",
      category: "Collecting",
      activeUsers: 35,
      tags: ["Vinyl", "Records", "Collecting"],
    },
    {
      id: "room4",
      name: "Festival Friends",
      description: "Find friends to attend music festivals with",
      image: "/chat-room-4.png",
      category: "Events",
      activeUsers: 56,
      tags: ["Festivals", "Events", "Friends"],
    },
    {
      id: "room5",
      name: "DJ Equipment Talk",
      description: "Discuss the latest DJ gear and setups",
      image: "/chat-room-5.png",
      category: "Equipment",
      activeUsers: 31,
      tags: ["DJ", "Equipment", "Tech"],
    },
    {
      id: "room6",
      name: "Music Theory",
      description: "Learn and discuss music theory concepts",
      image: "/chat-room-6.png",
      category: "Education",
      activeUsers: 24,
      tags: ["Theory", "Education", "Learning"],
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950">
      <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">
                <span className="text-orange-500">MIX</span> <span className="text-blue-500">& MINGLE</span>
                <span className="ml-2 rounded-md bg-blue-600 px-1.5 py-0.5 text-xs font-medium uppercase text-white">
                  Beta
                </span>
              </span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="text-sm font-medium text-white/70 hover:text-white">
                Home
              </Link>
              <Link href="/events" className="text-sm font-medium text-white/70 hover:text-white">
                Events
              </Link>
              <Link href="/dashboard/explore" className="text-sm font-medium text-white/70 hover:text-white">
                Connect
              </Link>
              <Link href="/streams" className="text-sm font-medium text-white/70 hover:text-white">
                Live Streams
              </Link>
              <Link href="/chat-rooms" className="text-sm font-medium text-white text-white">
                Chat Rooms
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-blue-600 text-blue-500 hover:bg-blue-950" asChild>
              <Link href="/join-beta">Join Beta</Link>
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tighter text-white">Chat Rooms</h1>
              <p className="text-gray-400">
                Join themed chat rooms to discuss music, find new friends, or just hang out
              </p>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:w-72">
                <Input
                  placeholder="Search chat rooms..."
                  className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-gray-800 text-gray-400 hover:bg-gray-900">
                  <Filter className="h-4 w-4 mr-2" /> Filter
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="h-4 w-4 mr-2" /> Create Room
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-gray-900 border-gray-800">
                <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  All Rooms
                </TabsTrigger>
                <TabsTrigger value="music" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Music
                </TabsTrigger>
                <TabsTrigger value="social" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Social
                </TabsTrigger>
                <TabsTrigger value="events" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Events
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {chatRooms.map((room) => (
                    <ChatRoomCard key={room.id} room={room} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="music" className="mt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {chatRooms
                    .filter((room) => room.category === "Music" || room.tags.includes("Music"))
                    .map((room) => (
                      <ChatRoomCard key={room.id} room={room} />
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="social" className="mt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {chatRooms
                    .filter((room) => room.tags.includes("Friends"))
                    .map((room) => (
                      <ChatRoomCard key={room.id} room={room} />
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="events" className="mt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {chatRooms
                    .filter((room) => room.category === "Events" || room.tags.includes("Events"))
                    .map((room) => (
                      <ChatRoomCard key={room.id} room={room} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

function ChatRoomCard({ room }) {
  return (
    <Card className="overflow-hidden bg-gray-900 border-gray-800">
      <div className="relative h-40 overflow-hidden">
        <img src={room.image || "/placeholder.svg"} alt={room.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
        <Badge className="absolute top-2 right-2 bg-blue-600">{room.category}</Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="text-xl font-bold text-white mb-1">{room.name}</h3>
        <p className="text-gray-400 mb-3 line-clamp-2">{room.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {room.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="border-gray-700 text-gray-300">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-400">
            <Users className="h-4 w-4 mr-1" />
            <span className="text-sm">{room.activeUsers} active</span>
          </div>
        </div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
          <Link href={`/chat-rooms/${room.id}`}>
            <MessageSquare className="h-4 w-4 mr-2" /> Join Room
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
