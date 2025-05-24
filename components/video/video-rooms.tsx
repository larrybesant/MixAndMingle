"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, Users, Plus, Star, PhoneCall } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getActiveVideoRooms, joinVideoRoom, createVideoRoom, leaveVideoRoom, type VideoRoom } from "@/lib/firestore"
import { toast } from "sonner"
import WebRTCVideoCall from "./webrtc-video-call"

export default function VideoRooms() {
  const { user, userData } = useAuth()
  const [inCall, setInCall] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<VideoRoom | null>(null)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [rooms, setRooms] = useState<VideoRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVideoRooms()
  }, [])

  const loadVideoRooms = async () => {
    try {
      setLoading(true)
      const activeRooms = await getActiveVideoRooms()
      setRooms(activeRooms)
    } catch (error) {
      console.error("Error loading video rooms:", error)
      toast.error("Failed to load video rooms")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async (room: VideoRoom) => {
    if (!user || !userData) return

    try {
      await joinVideoRoom(room.id, user.uid)
      setSelectedRoom(room)
      setInCall(true)
      toast.success(`Joined ${room.name}`)
    } catch (error) {
      console.error("Error joining video room:", error)
      toast.error("Failed to join video room")
    }
  }

  const handleLeaveCall = async () => {
    if (!selectedRoom || !user) return

    try {
      await leaveVideoRoom(selectedRoom.id, user.uid)
      setInCall(false)
      setSelectedRoom(null)
      toast.success("Left video call")
      loadVideoRooms() // Refresh room list
    } catch (error) {
      console.error("Error leaving video room:", error)
      toast.error("Failed to leave video room")
    }
  }

  const handleCreateRoom = async () => {
    if (!user || !userData) return

    try {
      const roomName = prompt("Enter video room name:")
      if (!roomName) return

      const roomType = confirm("Make this a premium room?") ? "premium" : "public"

      const roomId = await createVideoRoom({
        name: roomName,
        hostId: user.uid,
        hostName: userData.displayName || userData.firstName || "Anonymous",
        type: roomType,
        participants: [user.uid],
        maxParticipants: roomType === "premium" ? 6 : 12,
        settings: {
          allowChat: true,
          allowScreenShare: true,
          requireApproval: roomType === "private",
        },
      })

      toast.success("Video room created successfully!")
      loadVideoRooms()

      // Auto-join the created room
      const newRoom: VideoRoom = {
        id: roomId,
        name: roomName,
        hostId: user.uid,
        hostName: userData.displayName || userData.firstName || "Anonymous",
        type: roomType,
        participants: [user.uid],
        maxParticipants: roomType === "premium" ? 6 : 12,
        isActive: true,
        createdAt: new Date() as any,
        settings: {
          allowChat: true,
          allowScreenShare: true,
          requireApproval: roomType === "private",
        },
      }

      setSelectedRoom(newRoom)
      setInCall(true)
    } catch (error) {
      console.error("Error creating video room:", error)
      toast.error("Failed to create video room")
    }
  }

  const handleInstantMeeting = async () => {
    if (!user || !userData) return

    try {
      const roomName = `${userData.displayName || "User"}'s Meeting`

      const roomId = await createVideoRoom({
        name: roomName,
        hostId: user.uid,
        hostName: userData.displayName || userData.firstName || "Anonymous",
        type: "public",
        participants: [user.uid],
        maxParticipants: 8,
        settings: {
          allowChat: true,
          allowScreenShare: true,
          requireApproval: false,
        },
      })

      const instantRoom: VideoRoom = {
        id: roomId,
        name: roomName,
        hostId: user.uid,
        hostName: userData.displayName || userData.firstName || "Anonymous",
        type: "public",
        participants: [user.uid],
        maxParticipants: 8,
        isActive: true,
        createdAt: new Date() as any,
        settings: {
          allowChat: true,
          allowScreenShare: true,
          requireApproval: false,
        },
      }

      setSelectedRoom(instantRoom)
      setInCall(true)
      toast.success("Instant meeting started!")
    } catch (error) {
      console.error("Error creating instant meeting:", error)
      toast.error("Failed to start instant meeting")
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to access video rooms</p>
      </div>
    )
  }

  if (inCall && selectedRoom) {
    return (
      <WebRTCVideoCall
        room={selectedRoom}
        user={user}
        userData={userData}
        onLeaveCall={handleLeaveCall}
        videoEnabled={videoEnabled}
        audioEnabled={audioEnabled}
        onVideoToggle={setVideoEnabled}
        onAudioToggle={setAudioEnabled}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Video Rooms</h1>
        <Button onClick={handleCreateRoom}>
          <Plus className="h-4 w-4 mr-2" />
          Create Room
        </Button>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Start a video call instantly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col space-y-2" onClick={handleInstantMeeting}>
              <Video className="h-6 w-6" />
              <span>Instant Meeting</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={handleCreateRoom}>
              <Users className="h-6 w-6" />
              <span>Create Room</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <PhoneCall className="h-6 w-6" />
              <span>Join with ID</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Rooms */}
      <Card>
        <CardHeader>
          <CardTitle>Active Video Rooms</CardTitle>
          <CardDescription>Join ongoing video conversations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active video rooms. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <Card key={room.id} className="border-2 hover:border-purple-200 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        {room.type === "premium" && <Star className="h-4 w-4 text-yellow-500 mr-2" />}
                        {room.name}
                      </CardTitle>
                      <Badge variant={room.type === "private" ? "secondary" : "default"}>{room.type}</Badge>
                    </div>
                    <CardDescription>
                      Hosted by {room.hostName} • {room.participants.length}/{room.maxParticipants} participants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{room.participants.length} participants</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleJoinRoom(room)}
                        disabled={room.participants.length >= room.maxParticipants}
                      >
                        {room.participants.length >= room.maxParticipants ? "Full" : "Join"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Calls */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
          <CardDescription>Your call history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Team Standup", time: "2 hours ago", duration: "25 min", participants: 8 },
              { name: "Client Meeting", time: "Yesterday", duration: "1h 15min", participants: 4 },
              { name: "Coffee Chat", time: "2 days ago", duration: "45 min", participants: 12 },
            ].map((call, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Video className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{call.name}</p>
                    <p className="text-sm text-gray-600">
                      {call.time} • {call.duration}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {call.participants}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
