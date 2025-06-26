"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radio, Users, Plus, Play } from "lucide-react"

interface Room {
  id: string
  name: string
  description: string
  genre: string
  dj_name: string
  listener_count: number
  is_live: boolean
}

export default function RoomsFixedPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])

  useEffect(() => {
    const mockRooms: Room[] = [
      {
        id: "room-1",
        name: "House Vibes Only",
        description: "Deep house and progressive beats",
        genre: "House",
        dj_name: "DJ Sarah",
        listener_count: 234,
        is_live: true,
      },
      {
        id: "room-2",
        name: "Late Night Techno",
        description: "Dark techno for night owls",
        genre: "Techno",
        dj_name: "DJ Mike",
        listener_count: 156,
        is_live: true,
      },
      {
        id: "room-3",
        name: "Hip-Hop Classics",
        description: "90s and 2000s hip-hop hits",
        genre: "Hip-Hop",
        dj_name: "DJ Alex",
        listener_count: 89,
        is_live: true,
      },
    ]
    setRooms(mockRooms)
  }, [])

  const joinRoom = (roomId: string) => {
    alert(`Joining room: ${roomId}`)
    router.push(`/room/${roomId}`)
  }

  const createRoom = () => {
    alert("Create room clicked!")
    // In production, this would open a create room dialog
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Radio className="w-8 h-8 mr-3 text-purple-400" />
                Live DJ Rooms
              </h1>
              <p className="text-gray-400 mt-2">Join live streams and connect with DJs</p>
            </div>
            <button
              onClick={createRoom}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors flex items-center"
              style={{ pointerEvents: "auto" }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Room
            </button>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="bg-gray-900 border-gray-700 hover:border-purple-500 transition-colors">
              <CardContent className="p-0">
                {/* Room Image */}
                <div className="relative">
                  <img src="/hero-dj.jpg" alt={room.name} className="w-full h-48 object-cover rounded-t-lg" />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-red-600 text-white">
                      <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                      LIVE
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-black/60 text-white">
                      <Users className="w-3 h-3 mr-1" />
                      {room.listener_count}
                    </Badge>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-t-lg">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        joinRoom(room.id)
                      }}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors flex items-center"
                      style={{ pointerEvents: "auto" }}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Join Room
                    </button>
                  </div>
                </div>

                {/* Room Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1">{room.name}</h3>
                      <p className="text-sm text-gray-400 mb-2">by {room.dj_name}</p>
                    </div>
                    <Badge variant="outline" className="border-purple-400 text-purple-400 ml-2">
                      {room.genre}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-300 mb-4">{room.description}</p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          alert("Liked room!")
                        }}
                        className="text-gray-400 hover:text-red-400 cursor-pointer p-2 rounded transition-colors"
                        style={{ pointerEvents: "auto" }}
                      >
                        ❤️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          alert("Share room!")
                        }}
                        className="text-gray-400 hover:text-blue-400 cursor-pointer p-2 rounded transition-colors"
                        style={{ pointerEvents: "auto" }}
                      >
                        🔗
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        joinRoom(room.id)
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer transition-colors"
                      style={{ pointerEvents: "auto" }}
                    >
                      Join
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Test Section */}
        <div className="mt-12 p-6 bg-gray-900 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">Button Test Section</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => alert("Test Button 1 clicked!")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer transition-colors"
              style={{ pointerEvents: "auto" }}
            >
              Test Button 1
            </button>
            <button
              onClick={() => alert("Test Button 2 clicked!")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer transition-colors"
              style={{ pointerEvents: "auto" }}
            >
              Test Button 2
            </button>
            <button
              onClick={() => alert("Test Button 3 clicked!")}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded cursor-pointer transition-colors"
              style={{ pointerEvents: "auto" }}
            >
              Test Button 3
            </button>
            <button
              onClick={() => alert("Test Button 4 clicked!")}
              className="bg-yellow-600 hover:bg-yellow-700 text-black px-4 py-2 rounded cursor-pointer transition-colors"
              style={{ pointerEvents: "auto" }}
            >
              Test Button 4
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
