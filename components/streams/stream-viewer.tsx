"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { joinStream, leaveStream, sendStreamMessage, requestSong } from "@/app/actions/live-streams"
import { useState, useEffect, useRef, type FormEvent } from "react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { Users, Music, MessageSquare, Send, Wifi, WifiOff, Gauge } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useWebRTC } from "@/hooks/use-webrtc"
import { useWebRTCSupport } from "@/hooks/use-webrtc-support"
import WebRTCNotSupported from "@/components/streams/webrtc-not-supported"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StreamViewerProps {
  stream: {
    id: string
    title: string
    description: string
    status: string
    viewer_count: number
    dj: {
      artist_name: string
      profiles: {
        username: string
        full_name: string
        avatar_url: string
      }
    }
  }
  userId: string
}

export default function StreamViewer({ stream, userId }: StreamViewerProps) {
  const { toast } = useToast()
  const [viewerCount, setViewerCount] = useState(stream.viewer_count)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isJoined, setIsJoined] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [showStreamStats, setShowStreamStats] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const supabase = createClient()

  // Check WebRTC support
  const { isSupported: isWebRTCSupported } = useWebRTCSupport()

  // Handle remote streams from WebRTC
  const handleRemoteStream = (stream: MediaStream, peerId: string) => {
    setRemoteStreams((prev) => {
      const newStreams = new Map(prev)
      newStreams.set(peerId, stream)

      // If this is the first stream, set it as the main video
      if (newStreams.size === 1 && videoRef.current) {
        videoRef.current.srcObject = stream
      }

      return newStreams
    })
  }

  // Initialize WebRTC
  const {
    isConnected,
    error: webrtcError,
    connectionType,
    connectionQuality,
    availableBandwidth,
  } = useWebRTC({
    streamId: stream.id,
    localStream: null, // Viewers don't send streams
    onRemoteStream: handleRemoteStream,
    isBroadcaster: false,
  })

  useEffect(() => {
    if (webrtcError) {
      setIsReconnecting(true)
      toast({
        title: "Connection Error",
        description: webrtcError,
        variant: "destructive",
      })
    } else {
      setIsReconnecting(false)
    }
  }, [webrtcError, toast])

  useEffect(() => {
    // Join the stream when component mounts
    handleJoinStream()

    // Set up real-time listeners for new messages and viewer count updates
    const channel = supabase
      .channel(`stream:${stream.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "stream_chat_messages",
          filter: `stream_id=eq.${stream.id}`,
        },
        async (payload) => {
          // Fetch the user profile for this message
          const { data } = await supabase
            .from("profiles")
            .select("username, full_name, avatar_url")
            .eq("id", payload.new.user_id)
            .single()

          setMessages((prev) => [
            ...prev,
            {
              ...payload.new,
              profile: data,
            },
          ])
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_streams",
          filter: `id=eq.${stream.id}`,
        },
        (payload) => {
          setViewerCount(payload.new.viewer_count)
        },
      )
      .subscribe()

    // Load existing messages
    loadMessages()

    return () => {
      // Leave the stream when component unmounts
      handleLeaveStream()
      supabase.removeChannel(channel)
    }
  }, [stream.id, supabase])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom()
  }, [messages])

  async function loadMessages() {
    try {
      const { data } = await supabase
        .from("stream_chat_messages")
        .select(`
          *,
          profile:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("stream_id", stream.id)
        .order("created_at", { ascending: true })

      if (data) {
        setMessages(data)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  async function handleJoinStream() {
    try {
      const result = await joinStream(stream.id)
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setIsJoined(true)
      }
    } catch (error) {
      console.error("Error joining stream:", error)
    }
  }

  async function handleLeaveStream() {
    if (isJoined) {
      try {
        await leaveStream(stream.id)
        setIsJoined(false)
      } catch (error) {
        console.error("Error leaving stream:", error)
      }
    }
  }

  async function handleSendMessage(e: FormEvent) {
    e.preventDefault()

    if (!newMessage.trim()) return

    setIsSendingMessage(true)
    try {
      const result = await sendStreamMessage(stream.id, newMessage)
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setNewMessage("")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSendingMessage(false)
    }
  }

  async function handleSongRequest(formData: FormData) {
    try {
      const result = await requestSong(stream.id, formData)
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Song request submitted!",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit song request",
        variant: "destructive",
      })
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Format bandwidth for display
  function formatBandwidth(bps: number | null) {
    if (bps === null) return "Unknown"
    if (bps >= 1000000) {
      return `${(bps / 1000000).toFixed(1)} Mbps`
    } else {
      return `${(bps / 1000).toFixed(0)} Kbps`
    }
  }

  // Get resolution of the video
  function getVideoResolution() {
    if (!videoRef.current) return "Unknown"
    const width = videoRef.current.videoWidth
    const height = videoRef.current.videoHeight
    if (!width || !height) return "Loading..."
    return `${width}x${height}`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="bg-gradient-to-r from-orange-500 to-cyan-500 text-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{stream.title}</CardTitle>
                <CardDescription className="text-white/80">DJ: {stream.dj.artist_name}</CardDescription>
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                <span>{viewerCount} viewers</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {!isWebRTCSupported ? (
              <WebRTCNotSupported />
            ) : (
              <div className="aspect-video bg-black rounded-md overflow-hidden relative">
                {remoteStreams.size > 0 ? (
                  <>
                    <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 right-4 flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="secondary"
                              onClick={() => setShowStreamStats(!showStreamStats)}
                            >
                              <Gauge className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Stream Statistics</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-white flex items-center">
                      {isReconnecting ? (
                        <>
                          <WifiOff className="mr-2 h-5 w-5 animate-pulse" />
                          Reconnecting to stream...
                        </>
                      ) : isConnected ? (
                        <>
                          <Wifi className="mr-2 h-5 w-5" />
                          Waiting for DJ to start streaming...
                        </>
                      ) : (
                        <>
                          <Wifi className="mr-2 h-5 w-5 animate-pulse" />
                          Connecting to stream...
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {showStreamStats && remoteStreams.size > 0 && (
              <div className="mt-4 p-4 border rounded-md bg-muted/30">
                <h3 className="text-sm font-medium mb-2">Stream Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="font-medium">Resolution</p>
                    <p className="text-muted-foreground">{getVideoResolution()}</p>
                  </div>
                  <div>
                    <p className="font-medium">Bandwidth</p>
                    <p className="text-muted-foreground">{formatBandwidth(availableBandwidth)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Connection</p>
                    <p className="text-muted-foreground capitalize">{connectionQuality}</p>
                  </div>
                </div>
              </div>
            )}

            {stream.description && (
              <div className="mt-4">
                <h3 className="font-medium mb-1">About this stream</h3>
                <p className="text-sm text-muted-foreground">{stream.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {isConnected && (
          <Card>
            <CardHeader>
              <CardTitle>Stream Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {isReconnecting ? (
                    <>
                      <WifiOff className="mr-2 h-5 w-5 text-yellow-500 animate-pulse" />
                      <p>Reconnecting to streaming network...</p>
                    </>
                  ) : (
                    <>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <p>Connected to streaming network</p>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Connection Type</p>
                    <p className="text-sm text-muted-foreground">
                      {connectionType === "direct"
                        ? "Direct (P2P)"
                        : connectionType === "relay"
                          ? "Relay (TURN)"
                          : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Connection Quality</p>
                    <div className="flex items-center">
                      <div
                        className={`h-2 w-2 rounded-full mr-2 ${
                          connectionQuality === "good"
                            ? "bg-green-500"
                            : connectionQuality === "medium"
                              ? "bg-yellow-500"
                              : connectionQuality === "poor"
                                ? "bg-red-500"
                                : "bg-gray-500"
                        }`}
                      ></div>
                      <p className="text-sm text-muted-foreground capitalize">{connectionQuality}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Bandwidth</p>
                    <p className="text-sm text-muted-foreground">{formatBandwidth(availableBandwidth)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <Tabs defaultValue="chat">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center">
              <Music className="mr-2 h-4 w-4" />
              Request
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className="flex items-start space-x-3">
                          <Avatar>
                            <AvatarImage src={message.profile?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {message.profile?.username?.charAt(0) || message.profile?.full_name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">
                                {message.profile?.username || message.profile?.full_name || "Anonymous"}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No messages yet. Be the first to chat!</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <form onSubmit={handleSendMessage} className="w-full flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={isSendingMessage}
                  />
                  <Button type="submit" size="icon" disabled={isSendingMessage || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Request a Song</CardTitle>
                <CardDescription>Ask the DJ to play your favorite track</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-cyan-500 hover:from-orange-600 hover:to-cyan-600">
                      Make a Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form action={handleSongRequest}>
                      <DialogHeader>
                        <DialogTitle>Request a Song</DialogTitle>
                        <DialogDescription>Fill out the details of the song you'd like to hear</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="songTitle">Song Title</Label>
                          <Input id="songTitle" name="songTitle" required placeholder="Enter song title" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="artist">Artist</Label>
                          <Input id="artist" name="artist" placeholder="Enter artist name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message (Optional)</Label>
                          <Textarea id="message" name="message" placeholder="Add a message to the DJ..." rows={3} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Submit Request</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
