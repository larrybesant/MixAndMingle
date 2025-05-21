"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  increment,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase-client-safe"
import { useAuth } from "@/lib/auth-context"
import { useWebRTC } from "@/lib/webrtc-context"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Mic,
  MicOff,
  VideoIcon,
  VideoOff,
  Users,
  MessageSquare,
  PhoneOff,
  Music,
  Heart,
  Share,
  Star,
  Gift,
} from "lucide-react"
import { EnhancedChatRoom } from "@/components/enhanced-chat-room"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface DJRoomProps {
  roomId: string
}

export function DJRoom({ roomId }: DJRoomProps) {
  const [roomData, setRoomData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("video")
  const [participants, setParticipants] = useState<any[]>([])
  const [isHost, setIsHost] = useState(false)
  const [audioQuality, setAudioQuality] = useState("high")
  const [showAudioVisualizer, setShowAudioVisualizer] = useState(true)
  const [likeCount, setLikeCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [showGiftDialog, setShowGiftDialog] = useState(false)
  const [giftAmount, setGiftAmount] = useState("5")

  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const {
    localStream,
    remoteStreams,
    startLocalStream,
    stopLocalStream,
    joinRoom: joinWebRTCRoom,
    leaveRoom: leaveWebRTCRoom,
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
          const data = roomSnap.data()
          setRoomData(data)
          setLikeCount(data.likeCount || 0)

          // Check if current user is the host
          if (user && data.createdBy === user.uid) {
            setIsHost(true)
          }

          // Check if user has liked the room
          if (user) {
            const likeRef = doc(db, "rooms", roomId, "likes", user.uid)
            const likeSnap = await getDoc(likeRef)
            setHasLiked(likeSnap.exists())
          }
        } else {
          toast({
            variant: "destructive",
            title: "Room not found",
            description: "The DJ room you're looking for doesn't exist.",
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
  }, [roomId, user, router, toast])

  // Initialize WebRTC with optimized audio settings
  useEffect(() => {
    if (roomData && user) {
      const initRoom = async () => {
        // Configure audio constraints based on quality setting
        const audioConstraints = {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: audioQuality === "high" ? 48000 : 44100,
          channelCount: audioQuality === "high" ? 2 : 1,
        }

        // Start local stream with optimized audio
        const streamStarted = await startLocalStream(true, true, audioConstraints)

        if (streamStarted && localStream) {
          // Set up audio processing for DJ quality
          setupAudioProcessing(localStream)

          // Join the WebRTC room
          await joinWebRTCRoom(roomId)

          // Update participant count in Firestore
          await updateDoc(doc(db, "rooms", roomId), {
            participants: increment(1),
          })
        }
      }

      initRoom()
    }

    return () => {
      if (localStream) {
        leaveWebRTCRoom()
        stopLocalStream()
        cleanupAudioProcessing()

        // Update participant count when leaving
        if (roomId && user) {
          updateDoc(doc(db, "rooms", roomId), {
            participants: increment(-1),
          }).catch(console.error)
        }
      }
    }
  }, [roomData, user, roomId, audioQuality])

  // Set up audio visualizer
  useEffect(() => {
    if (showAudioVisualizer && localStream && canvasRef.current) {
      setupAudioVisualizer(localStream)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [showAudioVisualizer, localStream])

  // Listen for participants
  useEffect(() => {
    if (!roomId) return

    const participantsRef = collection(db, "rooms", roomId, "participants")
    const unsubscribe = onSnapshot(participantsRef, (snapshot) => {
      const participantsList: any[] = []

      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (data.isActive) {
          participantsList.push({
            id: doc.id,
            ...data,
          })
        }
      })

      setParticipants(participantsList)
    })

    return () => unsubscribe()
  }, [roomId])

  // Set up audio processing for DJ quality
  const setupAudioProcessing = (stream: MediaStream) => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      // Create analyser node
      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser
      analyser.fftSize = 2048

      // Create source from stream
      const source = audioContext.createMediaStreamSource(stream)

      // Create compressor for better audio dynamics
      const compressor = audioContext.createDynamicsCompressor()
      compressor.threshold.value = -24
      compressor.knee.value = 30
      compressor.ratio.value = 12
      compressor.attack.value = 0.003
      compressor.release.value = 0.25

      // Create EQ (3-band)
      const lowEQ = audioContext.createBiquadFilter()
      lowEQ.type = "lowshelf"
      lowEQ.frequency.value = 320
      lowEQ.gain.value = 0

      const midEQ = audioContext.createBiquadFilter()
      midEQ.type = "peaking"
      midEQ.frequency.value = 1000
      midEQ.Q.value = 0.5
      midEQ.gain.value = 0

      const highEQ = audioContext.createBiquadFilter()
      highEQ.type = "highshelf"
      highEQ.frequency.value = 3200
      highEQ.gain.value = 0

      // Connect nodes
      source.connect(lowEQ)
      lowEQ.connect(midEQ)
      midEQ.connect(highEQ)
      highEQ.connect(compressor)
      compressor.connect(analyser)

      // If we're the host, connect to destination (output)
      if (isHost) {
        analyser.connect(audioContext.destination)
      }
    } catch (error) {
      console.error("Error setting up audio processing:", error)
    }
  }

  // Clean up audio processing
  const cleanupAudioProcessing = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error)
      audioContextRef.current = null
    }

    analyserRef.current = null

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }

  // Set up audio visualizer
  const setupAudioVisualizer = (stream: MediaStream) => {
    if (!canvasRef.current || !audioContextRef.current || !analyserRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!canvas || !ctx || !analyser) return

      // Set canvas dimensions
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight

      // Get frequency data
      analyser.getByteFrequencyData(dataArray)

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw visualizer
      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height

        // Create gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0)
        gradient.addColorStop(0, "rgba(75, 86, 255, 0.8)") // Primary color
        gradient.addColorStop(0.5, "rgba(184, 51, 255, 0.8)") // Accent color
        gradient.addColorStop(1, "rgba(255, 95, 61, 0.8)") // Secondary color

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()
  }

  // Handle like/unlike
  const handleLike = async () => {
    if (!user) return

    try {
      const likeRef = doc(db, "rooms", roomId, "likes", user.uid)

      if (hasLiked) {
        // Unlike
        await updateDoc(doc(db, "rooms", roomId), {
          likeCount: increment(-1),
        })

        // Delete like document
        await deleteDoc(likeRef)

        setLikeCount((prev) => Math.max(0, prev - 1))
        setHasLiked(false)
      } else {
        // Like
        await updateDoc(doc(db, "rooms", roomId), {
          likeCount: increment(1),
        })

        // Create like document
        await setDoc(likeRef, {
          timestamp: serverTimestamp(),
        })

        setLikeCount((prev) => prev + 1)
        setHasLiked(true)
      }

      toast({
        title: hasLiked ? "Unliked" : "Liked",
        description: hasLiked ? "You've unliked this room" : "You've liked this room",
      })
    } catch (error) {
      console.error("Error liking/unliking room:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to like/unlike room. Please try again.",
      })
    }
  }

  // Handle sending a gift
  const handleSendGift = async () => {
    if (!user || !roomData) return

    try {
      const amount = Number.parseInt(giftAmount)

      if (isNaN(amount) || amount <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid amount",
          description: "Please enter a valid gift amount.",
        })
        return
      }

      // In a real app, you would check if the user has enough credits
      // and handle the payment processing

      // Record the gift transaction
      await addDoc(collection(db, "gifts"), {
        amount,
        senderId: user.uid,
        senderName: user.displayName,
        recipientId: roomData.createdBy,
        roomId,
        timestamp: serverTimestamp(),
      })

      // Update recipient's gift count
      const recipientRef = doc(db, "users", roomData.createdBy)
      await updateDoc(recipientRef, {
        giftsReceived: increment(1),
        totalGiftValue: increment(amount),
      })

      toast({
        title: "Gift sent",
        description: `You've sent a gift of $${amount} to the DJ.`,
      })

      setShowGiftDialog(false)
    } catch (error) {
      console.error("Error sending gift:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send gift. Please try again.",
      })
    }
  }

  // Handle leaving room
  const handleLeaveRoom = async () => {
    await leaveWebRTCRoom()
    stopLocalStream()
    cleanupAudioProcessing()

    // Update participant count
    if (roomId && user) {
      await updateDoc(doc(db, "rooms", roomId), {
        participants: increment(-1),
      })
    }

    router.push("/dashboard/video-rooms")
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading DJ room...</div>
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
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{roomData.name}</h2>
              <Badge variant="outline" className="text-xs">
                LIVE
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{roomData.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{participants.length}</span>
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="mt-2">
            <TabsTrigger value="video" className="data-[state=active]:bg-primary">
              <VideoIcon className="h-4 w-4 mr-2" />
              Stream
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-primary">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="video" className="flex-1 p-4 flex flex-col">
          <div className="grid grid-cols-1 gap-4 flex-1">
            {/* Main video stream */}
            <div className="relative bg-muted rounded-lg overflow-hidden">
              {isHost && localStream ? (
                <video
                  ref={(el) => {
                    if (el) el.srcObject = localStream
                  }}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : remoteStreams.size > 0 ? (
                <video
                  ref={(el) => {
                    if (el) el.srcObject = remoteStreams.values().next().value
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <Music className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Waiting for DJ to start streaming</h3>
                  <p className="text-muted-foreground text-center">
                    The DJ hasn't started streaming yet. Please wait or check back later.
                  </p>
                </div>
              )}

              {/* Audio visualizer overlay */}
              {showAudioVisualizer && (
                <canvas ref={canvasRef} className="absolute bottom-0 left-0 w-full h-1/3 opacity-80" />
              )}

              {/* Room info overlay */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={roomData.djPhotoURL || ""} />
                    <AvatarFallback>{roomData.djName?.[0]?.toUpperCase() || "DJ"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{roomData.djName}</p>
                    <p className="text-xs text-muted-foreground">DJ</p>
                  </div>
                </div>
              </div>

              {/* Interaction buttons */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`rounded-full ${hasLiked ? "bg-red-500 text-white border-none hover:bg-red-600" : "bg-black/60 backdrop-blur-sm"}`}
                        onClick={handleLike}
                      >
                        <Heart className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{hasLiked ? "Unlike" : "Like"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowGiftDialog(true)}
                      >
                        <Gift className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send Gift</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-black/60 backdrop-blur-sm"
                        onClick={() => {
                          navigator
                            .share({
                              title: roomData.name,
                              text: `Check out this DJ room on Mix & Mingle: ${roomData.name}`,
                              url: window.location.href,
                            })
                            .catch(console.error)
                        }}
                      >
                        <Share className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Share</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* DJ controls (only visible to host) */}
            {isHost && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium mb-4">DJ Controls</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="audio-quality">Audio Quality</Label>
                      <select
                        id="audio-quality"
                        value={audioQuality}
                        onChange={(e) => setAudioQuality(e.target.value)}
                        className="bg-muted p-2 rounded-md"
                      >
                        <option value="standard">Standard (44.1kHz Mono)</option>
                        <option value="high">High (48kHz Stereo)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="visualizer">Audio Visualizer</Label>
                      <Switch id="visualizer" checked={showAudioVisualizer} onCheckedChange={setShowAudioVisualizer} />
                    </div>

                    <div className="space-y-2">
                      <Label>Audio Controls</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">Low</Label>
                          <Slider defaultValue={[0]} min={-12} max={12} step={1} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Mid</Label>
                          <Slider defaultValue={[0]} min={-12} max={12} step={1} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">High</Label>
                          <Slider defaultValue={[0]} min={-12} max={12} step={1} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {isHost && (
              <>
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
              </>
            )}

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
          <EnhancedChatRoom roomId={roomId} />
        </TabsContent>
      </Tabs>

      {/* Gift Dialog */}
      <Dialog open={showGiftDialog} onOpenChange={setShowGiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send a Gift to the DJ</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[5, 10, 20, 50, 100, 200].map((amount) => (
                <Button
                  key={amount}
                  variant={giftAmount === amount.toString() ? "default" : "outline"}
                  onClick={() => setGiftAmount(amount.toString())}
                  className="relative"
                >
                  ${amount}
                  {amount >= 50 && <Star className="absolute top-1 right-1 h-3 w-3 text-yellow-400" />}
                </Button>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="custom-amount">Custom Amount</Label>
              <Input
                id="custom-amount"
                type="number"
                min="1"
                value={giftAmount}
                onChange={(e) => setGiftAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <Button onClick={handleSendGift} className="w-full">
              Send Gift
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
