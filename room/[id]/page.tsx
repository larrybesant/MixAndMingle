"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Users,
  Heart,
  MessageCircle,
  Send,
  LogOut,
  Crown,
  Radio,
  Share2,
} from "lucide-react"

interface ChatMessage {
  id: string
  user_id: string
  username: string
  avatar?: string
  message: string
  timestamp: string
  type: "message" | "join" | "leave" | "reaction"
}

interface RoomData {
  id: string
  name: string
  description: string
  genre: string
  dj_name: string
  dj_avatar?: string
  listener_count: number
  is_live: boolean
  created_at: string
}

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const roomId = params.id as string

  // Media refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // State
  const [room, setRoom] = useState<RoomData | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Mock room data
  useEffect(() => {
    const mockRoom: RoomData = {
      id: roomId,
      name: "House Vibes Only",
      description: "Deep house and progressive beats to keep you moving",
      genre: "House",
      dj_name: "DJ Sarah",
      dj_avatar: "/placeholder.svg?height=40&width=40",
      listener_count: 234,
      is_live: true,
      created_at: new Date().toISOString(),
    }
    setRoom(mockRoom)

    // Mock chat messages
    const mockMessages: ChatMessage[] = [
      {
        id: "1",
        user_id: "user1",
        username: "MusicLover23",
        message: "This track is amazing! 🔥",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: "message",
      },
      {
        id: "2",
        user_id: "user2",
        username: "BeatHead",
        message: "Just joined! Love the vibes",
        timestamp: new Date(Date.now() - 240000).toISOString(),
        type: "message",
      },
      {
        id: "3",
        user_id: "user3",
        username: "DanceQueen",
        message: "Can't stop dancing! 💃",
        timestamp: new Date(Date.now() - 180000).toISOString(),
        type: "message",
      },
    ]
    setMessages(mockMessages)
  }, [roomId])

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages])

  // Initialize media stream
  const initializeMedia = async () => {
    try {
      setIsJoining(true)
      setConnectionError(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      setIsConnected(true)

      // Add join message
      const joinMessage: ChatMessage = {
        id: Date.now().toString(),
        user_id: user?.id || "anonymous",
        username: profile?.username || user?.email?.split("@")[0] || "Anonymous",
        message: "joined the room",
        timestamp: new Date().toISOString(),
        type: "join",
      }
      setMessages((prev) => [...prev, joinMessage])
    } catch (error) {
      console.error("Failed to access media devices:", error)
      setConnectionError("Failed to access camera/microphone. Please check permissions.")
    } finally {
      setIsJoining(false)
    }
  }

  // Toggle microphone
  const toggleMicrophone = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      user_id: user?.id || "anonymous",
      username: profile?.username || user?.email?.split("@")[0] || "Anonymous",
      avatar: profile?.avatar_url,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: "message",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  // Leave room
  const leaveRoom = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }
    router.push("/rooms")
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-white">Loading room...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/rooms")} className="text-gray-400 hover:text-white">
                ← Back to Rooms
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center">
                  <Radio className="w-5 h-5 mr-2 text-red-500 animate-pulse" />
                  {room.name}
                </h1>
                <p className="text-sm text-gray-400">
                  by {room.dj_name} • {room.genre}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-red-600 text-white animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                LIVE
              </Badge>
              <Badge variant="outline" className="border-purple-400 text-purple-400">
                <Users className="w-3 h-3 mr-1" />
                {room.listener_count}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stream Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* DJ Stream */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-purple-900/50 to-black rounded-lg overflow-hidden">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    poster="/hero-dj.jpg"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12 border-2 border-purple-400">
                          <AvatarImage src={room.dj_avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {room.dj_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-white">{room.dj_name}</h3>
                            <Crown className="w-4 h-4 text-yellow-400" />
                          </div>
                          <p className="text-sm text-gray-300">Now Playing: Deep House Mix</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Video (if connected) */}
            {isConnected && (
              <Card className="bg-black/40 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Your Video</h3>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant={isMuted ? "destructive" : "secondary"} onClick={toggleMicrophone}>
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant={isVideoOff ? "destructive" : "secondary"} onClick={toggleVideo}>
                        {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={leaveRoom}>
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {isVideoOff && (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <VideoOff className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Connection Error */}
            {connectionError && (
              <Alert variant="destructive">
                <AlertDescription>{connectionError}</AlertDescription>
              </Alert>
            )}

            {/* Join Controls */}
            {!isConnected && (
              <Card className="bg-black/40 border-purple-500/30">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-white mb-4">Join the Live Stream</h3>
                  <p className="text-gray-400 mb-6">
                    Connect your camera and microphone to interact with the DJ and other listeners
                  </p>
                  <Button
                    onClick={initializeMedia}
                    disabled={isJoining}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isJoining ? (
                      <>
                        <Radio className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 mr-2" />
                        Join Stream
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chat Sidebar */}
          <div className="space-y-6">
            {/* Room Info */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardContent className="p-4">
                <h3 className="font-semibold text-white mb-2">Room Info</h3>
                <p className="text-sm text-gray-300 mb-4">{room.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Genre</span>
                  <Badge variant="outline" className="border-purple-400 text-purple-400">
                    {room.genre}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="font-semibold text-white flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Live Chat
                  </h3>
                </div>
                <ScrollArea className="h-96 p-4" ref={chatScrollRef}>
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={message.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-purple-600 text-white text-xs">
                            {message.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-purple-400">{message.username}</span>
                            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-300 break-words">
                            {message.type === "join" ? (
                              <span className="italic text-green-400">joined the room</span>
                            ) : (
                              message.message
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                    />
                    <Button onClick={sendMessage} size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Controls */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardContent className="p-4">
                <h3 className="font-semibold text-white mb-4">Audio Controls</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Speaker Volume</span>
                    <Button
                      size="sm"
                      variant={isSpeakerMuted ? "destructive" : "secondary"}
                      onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                    >
                      {isSpeakerMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
