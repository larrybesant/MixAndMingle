"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Radio, Users, Search, Plus, Play, MessageCircle, Heart, Share2, Loader2 } from "lucide-react"

interface Room {
  id: string
  name: string
  description: string
  genre: string
  dj_name: string
  dj_avatar?: string
  listener_count: number
  is_live: boolean
  created_at: string
  thumbnail?: string
  tags: string[]
}

export default function RoomsPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    genre: "",
    tags: "",
  })

  // Mock rooms data (in production, this would come from Supabase)
  useEffect(() => {
    const mockRooms: Room[] = [
      {
        id: "room-1",
        name: "House Vibes Only",
        description: "Deep house and progressive beats to keep you moving",
        genre: "House",
        dj_name: "DJ Sarah",
        dj_avatar: "/placeholder.svg?height=40&width=40",
        listener_count: 234,
        is_live: true,
        created_at: new Date().toISOString(),
        thumbnail: "/dj-room-1.jpg",
        tags: ["Deep House", "Progressive", "Chill"],
      },
      {
        id: "room-2",
        name: "Late Night Techno",
        description: "Dark techno for the night owls",
        genre: "Techno",
        dj_name: "DJ Mike",
        dj_avatar: "/placeholder.svg?height=40&width=40",
        listener_count: 156,
        is_live: true,
        created_at: new Date().toISOString(),
        thumbnail: "/dj-room-2.jpg",
        tags: ["Dark Techno", "Underground", "Minimal"],
      },
      {
        id: "room-3",
        name: "Hip-Hop Classics",
        description: "The best hip-hop tracks from the 90s and 2000s",
        genre: "Hip-Hop",
        dj_name: "DJ Alex",
        dj_avatar: "/placeholder.svg?height=40&width=40",
        listener_count: 89,
        is_live: true,
        created_at: new Date().toISOString(),
        thumbnail: "/dj-room-3.jpg",
        tags: ["90s Hip-Hop", "Classics", "Old School"],
      },
      {
        id: "room-4",
        name: "Chill Lounge",
        description: "Relaxing beats for work and study",
        genre: "Ambient",
        dj_name: "DJ Luna",
        dj_avatar: "/placeholder.svg?height=40&width=40",
        listener_count: 67,
        is_live: true,
        created_at: new Date().toISOString(),
        thumbnail: "/placeholder.svg?height=200&width=300",
        tags: ["Chill", "Ambient", "Study"],
      },
    ]

    setRooms(mockRooms)
    setFilteredRooms(mockRooms)
  }, [])

  // Filter rooms based on search and genre
  useEffect(() => {
    let filtered = rooms

    if (searchQuery) {
      filtered = filtered.filter(
        (room) =>
          room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.dj_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.genre.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedGenre !== "all") {
      filtered = filtered.filter((room) => room.genre.toLowerCase() === selectedGenre.toLowerCase())
    }

    setFilteredRooms(filtered)
  }, [searchQuery, selectedGenre, rooms])

  const handleCreateRoom = async () => {
    if (!newRoom.name || !newRoom.genre) {
      return
    }

    setIsCreatingRoom(true)

    try {
      // In production, this would create a room in Supabase
      const room: Room = {
        id: `room-${Date.now()}`,
        name: newRoom.name,
        description: newRoom.description,
        genre: newRoom.genre,
        dj_name: profile?.full_name || user?.email || "Anonymous DJ",
        dj_avatar: profile?.avatar_url,
        listener_count: 0,
        is_live: true,
        created_at: new Date().toISOString(),
        tags: newRoom.tags.split(",").map((tag) => tag.trim()),
      }

      setRooms((prev) => [room, ...prev])
      setIsCreateDialogOpen(false)
      setNewRoom({ name: "", description: "", genre: "", tags: "" })

      // Redirect to the new room
      router.push(`/room/${room.id}`)
    } catch (error) {
      console.error("Failed to create room:", error)
    } finally {
      setIsCreatingRoom(false)
    }
  }

  const joinRoom = (roomId: string) => {
    router.push(`/room/${roomId}`)
  }

  const genres = ["all", "House", "Techno", "Hip-Hop", "Ambient", "Jazz", "Rock", "Electronic"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Radio className="w-6 h-6 mr-2 text-purple-400" />
                Live DJ Rooms
              </h1>
              <p className="text-gray-400">Join live streams and connect with DJs worldwide</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 border-purple-500/30">
                <DialogHeader>
                  <DialogTitle className="text-white">Create Your DJ Room</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Room Name</label>
                    <Input
                      placeholder="e.g., Late Night Vibes"
                      value={newRoom.name}
                      onChange={(e) => setNewRoom((prev) => ({ ...prev, name: e.target.value }))}
                      className="bg-gray-900/50 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Description</label>
                    <Textarea
                      placeholder="Describe your room and music style..."
                      value={newRoom.description}
                      onChange={(e) => setNewRoom((prev) => ({ ...prev, description: e.target.value }))}
                      className="bg-gray-900/50 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Genre</label>
                    <Select
                      value={newRoom.genre}
                      onValueChange={(value) => setNewRoom((prev) => ({ ...prev, genre: value }))}
                    >
                      <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-600">
                        {genres.slice(1).map((genre) => (
                          <SelectItem key={genre} value={genre} className="text-white hover:bg-gray-800">
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Tags (comma separated)</label>
                    <Input
                      placeholder="e.g., Deep House, Chill, Progressive"
                      value={newRoom.tags}
                      onChange={(e) => setNewRoom((prev) => ({ ...prev, tags: e.target.value }))}
                      className="bg-gray-900/50 border-gray-600 text-white"
                    />
                  </div>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={isCreatingRoom || !newRoom.name || !newRoom.genre}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isCreatingRoom ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Room...
                      </>
                    ) : (
                      <>
                        <Radio className="w-4 h-4 mr-2" />
                        Go Live
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search rooms, DJs, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/40 border-purple-500/30 text-white placeholder-gray-400"
            />
          </div>
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-full md:w-48 bg-black/40 border-purple-500/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-purple-500/30">
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre} className="text-white hover:bg-purple-600/20">
                  {genre === "all" ? "All Genres" : genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-black/40 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{filteredRooms.length}</div>
              <div className="text-sm text-gray-400">Live Rooms</div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {filteredRooms.reduce((sum, room) => sum + room.listener_count, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Listeners</div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{new Set(filteredRooms.map((r) => r.genre)).size}</div>
              <div className="text-sm text-gray-400">Genres</div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-400">{filteredRooms.filter((r) => r.is_live).length}</div>
              <div className="text-sm text-gray-400">Live Now</div>
            </CardContent>
          </Card>
        </div>

        {/* Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <Card className="bg-black/40 border-purple-500/30">
            <CardContent className="p-8 text-center">
              <Radio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No rooms found</h3>
              <p className="text-gray-400 mb-4">Try adjusting your search or create a new room</p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Room
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card
                key={room.id}
                className="bg-black/40 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group cursor-pointer"
                onClick={() => joinRoom(room.id)}
              >
                <div className="relative">
                  <img
                    src={room.thumbnail || "/placeholder.svg?height=200&width=300"}
                    alt={room.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-red-600 text-white animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                      LIVE
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-black/60 text-white">
                      <Users className="w-3 h-3 mr-1" />
                      {room.listener_count}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button size="lg" className="bg-white/20 backdrop-blur-md hover:bg-white/30">
                      <Play className="w-6 h-6 mr-2" />
                      Join Room
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-purple-400 transition-colors">
                        {room.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">by {room.dj_name}</p>
                    </div>
                    <Badge variant="outline" className="border-purple-400 text-purple-400">
                      {room.genre}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">{room.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {room.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white p-1">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white p-1">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white p-1">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        joinRoom(room.id)
                      }}
                    >
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
