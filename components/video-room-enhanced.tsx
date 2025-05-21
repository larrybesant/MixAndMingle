"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, collection, addDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase-client-safe"
import { useAuth } from "@/lib/auth-context"
import { useWebRTC } from "@/lib/webrtc-context"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Mic,
  MicOff,
  VideoIcon,
  VideoOff,
  Users,
  MessageSquare,
  ScreenShare,
  PhoneOff,
  Volume2,
  VolumeX,
  Send,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "@/lib/toast-context" // Import useToast

interface Participant {
  id: string
  displayName: string
  photoURL?: string
  isSpeaking?: boolean
}

interface ChatMessage {
  id: string
  text: string
  userId: string
  displayName: string
  photoURL?: string
  timestamp: string
}

export function VideoRoomEnhanced({ roomId }: { roomId: string }) {
  const [roomData, setRoomData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState("video")
  const [isSharing, setIsSharing] = useState(false)
  const [audioOutputMuted, setAudioOutputMuted] = useState(false)

  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast() // Declare useToast
  const chatEndRef = useRef<HTMLDivElement>(null)

  const {
    localStream,
    remoteStreams,
    startLocalStream,
    stopLocalStream,
    joinRoom,
    leaveRoom,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
    isConnecting,
    error,
  } = useWebRTC()

  // Fetch room data
  useEffect(() => {
    async function fetchRoomData() {
      try {
        const roomRef = doc(db, "rooms", roomId)
        const roomSnap = await getDoc(roomRef)

        if (roomSnap.exists()) {
          setRoomData(roomSnap.data())
        } else {
          toast({
            variant: "destructive",
            title: "Room not found",
            description: "The video room you're looking for doesn't exist.",
          })
          router.push("/dashboard/video-rooms")
        }
      } catch (error) {
        console.error("Error fetching room data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoomData()
  }, [roomId, router, toast])

  // Initialize media and join room
  useEffect(() => {
    if (roomData && user && !localStream) {
      const initRoom = async () => {
        const streamStarted = await startLocalStream(true, true)
        if (streamStarted) {
          await joinRoom(roomId)
        }
      }

      initRoom()
    }

    return () => {
      if (localStream) {
        leaveRoom()
        stopLocalStream()
      }
    }
  }, [roomData, user, localStream, roomId])

  // Listen for participants
  useEffect(() => {
    if (!roomId || !user) return

    const participantsRef = collection(db, "rooms", roomId, "participants")
    const unsubscribe = onSnapshot(participantsRef, (snapshot) => {
      const participantsList: Participant[] = []

      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (data.isActive) {
          participantsList.push({
            id: doc.id,
            displayName: data.displayName,
            photoURL: data.photoURL,
            isSpeaking: false,
          })
        }
      })

      setParticipants(participantsList)
    })

    return () => unsubscribe()
  }, [roomId, user])

  // Listen for chat messages
  useEffect(() => {
    if (!roomId) return

    const messagesRef = collection(db, "rooms", roomId, "messages")
    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const messagesList: ChatMessage[] = []

      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        messagesList.push({
          id: doc.id,
          text: data.text,
          userId: data.userId,
          displayName: data.displayName,
          photoURL: data.photoURL,
          timestamp: data.timestamp,
        })
      })

      // Sort messages by timestamp
      messagesList.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      setChatMessages(messagesList)

      // Scroll to bottom of chat
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    })

    return () => unsubscribe()
  }, [roomId])

  // Send chat message
  const sendMessage = async () => {
    if (!message.trim() || !user || !roomId) return

    try {
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        text: message.trim(),
        userId: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        timestamp: new Date().toISOString(),
      })

      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      })
    }
  }

  // Toggle screen sharing
  const toggleScreenSharing = async () => {
    if (isSharing) {
      // Stop screen sharing, revert to camera
      stopLocalStream()
      await startLocalStream(isVideoEnabled, isAudioEnabled)
      setIsSharing(false)
    } else {
      try {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })

        stopLocalStream()
        screenStream.getVideoTracks()[0].onended = () => {
          // Handle case when user stops sharing via browser UI
          stopLocalStream()
          startLocalStream(isVideoEnabled, isAudioEnabled)
          setIsSharing(false)
        }

        // Replace local stream with screen sharing stream
        setIsSharing(true)
      } catch (error) {
        console.error("Error starting screen share:", error)
        toast({
          variant: "destructive",
          title: "Screen Sharing Failed",
          description: "Could not start screen sharing. Please try again.",
        })
      }
    }
  }

  // Handle leaving room
  const handleLeaveRoom = async () => {
    await leaveRoom()
    stopLocalStream()
    router.push("/dashboard/video-rooms")
  }

  // Toggle audio output (speakers)
  const toggleAudioOutput = () => {
    setAudioOutputMuted(!audioOutputMuted)

    // Mute/unmute all remote audio elements
    document.querySelectorAll("video").forEach((video) => {
      video.muted = !audioOutputMuted
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading room...</div>
  }

  if (!roomData) {
    return <div className="flex items-center justify-center h-full">Room not found</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.push("/dashboard/video-rooms")}>Return to Video Rooms</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/video-rooms")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">{roomData.name}</h2>
            <p className="text-sm text-muted-foreground">{roomData.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-full px-3 py-1">
            <Users className="h-4 w-4 text-primary" />
            <span>{participants.length}</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="mt-2">
            <TabsTrigger value="video" className="data-[state=active]:bg-primary">
              <VideoIcon className="h-4 w-4 mr-2" />
              Video
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-primary">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="video" className="flex-1 p-4 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
            {/* Local video */}
            <div className="relative bg-muted rounded-lg overflow-hidden">
              {localStream && (
                <video
                  ref={(el) => {
                    if (el) el.srcObject = localStream
                  }}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-xs">
                You {isSharing ? "(Screen)" : ""}
              </div>
            </div>

            {/* Remote videos */}
            {Array.from(remoteStreams).map(([participantId, stream]) => {
              const participant = participants.find((p) => p.id === participantId)
              return (
                <div key={participantId} className="relative bg-muted rounded-lg overflow-hidden">
                  <video
                    ref={(el) => {
                      if (el) {
                        el.srcObject = stream
                        el.muted = audioOutputMuted
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-xs">
                    {participant?.displayName || "Unknown"}
                    {participant?.isSpeaking && <span className="ml-2 text-green-400">●</span>}
                  </div>
                </div>
              )
            })}

            {/* Empty slots for layout consistency */}
            {[...Array(Math.max(0, 3 - 1 - remoteStreams.size))].map((_, i) => (
              <div key={i} className="bg-muted/40 rounded-lg flex items-center justify-center">
                <Users className="h-12 w-12 text-muted-foreground/40" />
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-full h-12 w-12 ${!isAudioEnabled ? "bg-red-500 text-white border-none hover:bg-red-600" : ""}`}
                    onClick={toggleAudio}
                  >
                    {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isAudioEnabled ? "Mute Microphone" : "Unmute Microphone"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-full h-12 w-12 ${!isVideoEnabled ? "bg-red-500 text-white border-none hover:bg-red-600" : ""}`}
                    onClick={toggleVideo}
                  >
                    {isVideoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-full h-12 w-12 ${isSharing ? "bg-primary text-white border-none hover:bg-primary/90" : ""}`}
                    onClick={toggleScreenSharing}
                  >
                    <ScreenShare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isSharing ? "Stop Screen Sharing" : "Share Screen"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-full h-12 w-12 ${audioOutputMuted ? "bg-red-500 text-white border-none hover:bg-red-600" : ""}`}
                    onClick={toggleAudioOutput}
                  >
                    {audioOutputMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{audioOutputMuted ? "Unmute Speakers" : "Mute Speakers"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-12 w-12 bg-red-500 text-white border-none hover:bg-red-600"
                    onClick={handleLeaveRoom}
                  >
                    <PhoneOff className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Leave Room</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No messages yet. Start the conversation!</div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.userId === user?.uid ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex ${message.userId === user?.uid ? "flex-row-reverse" : "flex-row"} items-start gap-2 max-w-[80%]`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.photoURL || ""} />
                        <AvatarFallback>{message.displayName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div
                          className={`flex ${message.userId === user?.uid ? "justify-end" : "justify-start"} items-center gap-2`}
                        >
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="font-medium text-sm">{message.displayName}</span>
                        </div>
                        <div
                          className={`mt-1 p-3 rounded-lg ${
                            message.userId === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
