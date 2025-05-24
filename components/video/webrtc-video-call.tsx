"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  Settings,
  Users,
  MessageSquare,
  MoreVertical,
} from "lucide-react"
import { toast } from "sonner"
import type { User } from "firebase/auth"

interface VideoRoom {
  id: string
  name: string
  hostId: string
  hostName: string
  type: "public" | "private" | "premium"
  participants: string[]
  maxParticipants: number
  isActive: boolean
  createdAt: any
  settings: {
    allowChat: boolean
    allowScreenShare: boolean
    requireApproval: boolean
  }
}

interface UserData {
  uid: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  username: string
  subscriptionTier: string
}

interface WebRTCVideoCallProps {
  room: VideoRoom
  user: User
  userData: UserData | null
  onLeaveCall: () => void
  videoEnabled: boolean
  audioEnabled: boolean
  onVideoToggle: (enabled: boolean) => void
  onAudioToggle: (enabled: boolean) => void
}

interface Participant {
  id: string
  name: string
  avatar: string
  isHost: boolean
  videoEnabled: boolean
  audioEnabled: boolean
  speaking: boolean
}

export default function WebRTCVideoCall({
  room,
  user,
  userData,
  onLeaveCall,
  videoEnabled,
  audioEnabled,
  onVideoToggle,
  onAudioToggle,
}: WebRTCVideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const [callDuration, setCallDuration] = useState(0)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const callStartTime = useRef<number>(Date.now())

  // Initialize participants with current user and mock participants
  useEffect(() => {
    const mockParticipants: Participant[] = [
      {
        id: user.uid,
        name: userData?.displayName || userData?.firstName || "You",
        avatar: user.photoURL || "YU",
        isHost: room.hostId === user.uid,
        videoEnabled,
        audioEnabled,
        speaking: false,
      },
      // Add some mock participants for demo
      {
        id: "participant-1",
        name: room.hostName,
        avatar: "HO",
        isHost: room.hostId !== user.uid,
        videoEnabled: true,
        audioEnabled: true,
        speaking: Math.random() > 0.7,
      },
      {
        id: "participant-2",
        name: "DJ Sarah",
        avatar: "DS",
        isHost: false,
        videoEnabled: true,
        audioEnabled: false,
        speaking: false,
      },
    ]

    setParticipants(mockParticipants.slice(0, Math.min(room.participants.length + 1, room.maxParticipants)))
  }, [room, user, userData, videoEnabled, audioEnabled])

  // Initialize media stream
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        setConnectionStatus("connecting")

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled,
          audio: audioEnabled,
        })

        setLocalStream(stream)

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        setConnectionStatus("connected")
        toast.success(`Connected to ${room.name}`)
      } catch (error) {
        console.error("Error accessing media devices:", error)
        setConnectionStatus("disconnected")
        toast.error("Failed to access camera/microphone")
      }
    }

    initializeMedia()

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Update call duration
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Handle video toggle
  const handleVideoToggle = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled
        onVideoToggle(!videoEnabled)
      }
    }
  }, [localStream, videoEnabled, onVideoToggle])

  // Handle audio toggle
  const handleAudioToggle = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled
        onAudioToggle(!audioEnabled)
      }
    }
  }, [localStream, audioEnabled, onAudioToggle])

  // Handle screen sharing
  const handleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })

        setIsScreenSharing(true)
        toast.success("Screen sharing started")

        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          toast.info("Screen sharing stopped")
        }
      } else {
        setIsScreenSharing(false)
        toast.info("Screen sharing stopped")
      }
    } catch (error) {
      console.error("Error sharing screen:", error)
      toast.error("Failed to share screen")
    }
  }, [isScreenSharing])

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle leave call
  const handleLeaveCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }
    onLeaveCall()
    toast.success("Left the call")
  }, [localStream, onLeaveCall])

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">{room.name}</h1>
          <Badge variant={room.type === "premium" ? "default" : "secondary"}>{room.type}</Badge>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "connecting"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
            />
            <span>{connectionStatus}</span>
            <span>•</span>
            <span>{formatDuration(callDuration)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setShowChat(!showChat)}>
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Users className="h-4 w-4" />
            <span className="ml-1">{participants.length}</span>
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div
          className={`grid gap-4 h-full ${
            participants.length === 1
              ? "grid-cols-1"
              : participants.length === 2
                ? "grid-cols-2"
                : participants.length <= 4
                  ? "grid-cols-2 grid-rows-2"
                  : participants.length <= 6
                    ? "grid-cols-3 grid-rows-2"
                    : "grid-cols-3 grid-rows-3"
          }`}
        >
          {participants.map((participant, index) => (
            <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
              {participant.id === user.uid ? (
                // Local video
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${!videoEnabled ? "hidden" : ""}`}
                />
              ) : (
                // Remote video placeholder
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={`/placeholder.svg?height=80&width=80&text=${participant.avatar}`} />
                    <AvatarFallback className="text-2xl">{participant.avatar}</AvatarFallback>
                  </Avatar>
                </div>
              )}

              {/* Video disabled overlay */}
              {!participant.videoEnabled && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={`/placeholder.svg?height=80&width=80&text=${participant.avatar}`} />
                    <AvatarFallback className="text-2xl">{participant.avatar}</AvatarFallback>
                  </Avatar>
                </div>
              )}

              {/* Participant info */}
              <div className="absolute bottom-2 left-2 flex items-center space-x-2">
                <span className="text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                  {participant.name}
                  {participant.isHost && " (Host)"}
                </span>
                {participant.speaking && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
              </div>

              {/* Audio/Video status */}
              <div className="absolute top-2 right-2 flex space-x-1">
                {!participant.audioEnabled && (
                  <div className="bg-red-500 p-1 rounded">
                    <MicOff className="h-3 w-3" />
                  </div>
                )}
                {!participant.videoEnabled && (
                  <div className="bg-red-500 p-1 rounded">
                    <VideoOff className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 p-4 bg-gray-900">
        <Button
          variant={audioEnabled ? "default" : "destructive"}
          size="lg"
          className="rounded-full w-12 h-12"
          onClick={handleAudioToggle}
        >
          {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button
          variant={videoEnabled ? "default" : "destructive"}
          size="lg"
          className="rounded-full w-12 h-12"
          onClick={handleVideoToggle}
        >
          {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        {room.settings.allowScreenShare && (
          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            className="rounded-full w-12 h-12"
            onClick={handleScreenShare}
          >
            <Monitor className="h-5 w-5" />
          </Button>
        )}

        <Button variant="destructive" size="lg" className="rounded-full w-12 h-12" onClick={handleLeaveCall}>
          <PhoneOff className="h-5 w-5" />
        </Button>

        <Button variant="outline" size="lg" className="rounded-full w-12 h-12">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="absolute right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Chat</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
              ×
            </Button>
          </div>
          <div className="text-sm text-gray-400 text-center">Chat functionality coming soon...</div>
        </div>
      )}
    </div>
  )
}
