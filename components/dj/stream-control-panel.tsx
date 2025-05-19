"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { updateStreamStatus, getSongRequests, updateSongRequestStatus } from "@/app/actions/live-streams"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Mic, MicOff, Video, VideoOff, Users, Music, MessageSquare, WifiOff, Settings } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useWebRTC } from "@/hooks/use-webrtc"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StreamControlPanelProps {
  stream: {
    id: string
    title: string
    status: "scheduled" | "live" | "ended" | "cancelled"
    viewer_count: number
    stream_key: string
  }
}

export default function StreamControlPanel({ stream }: StreamControlPanelProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState(stream.status)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [songRequests, setSongRequests] = useState<any[]>([])
  const [viewerCount, setViewerCount] = useState(stream.viewer_count)
  const [messages, setMessages] = useState<any[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const supabase = createClient()

  // Initialize WebRTC
  const {
    isConnected,
    error: webrtcError,
    viewerCount: webrtcViewerCount,
    connectionType,
    connectionQuality,
    currentQuality,
    availableBandwidth,
    isAdaptingBandwidth,
    setQualityLevel,
  } = useWebRTC({
    streamId: stream.id,
    localStream,
    onRemoteStream: () => {}, // DJ doesn't need to handle remote streams
    isBroadcaster: true,
    initialQuality: "auto",
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
    // Update viewer count from WebRTC
    if (isConnected) {
      setViewerCount(webrtcViewerCount)
    }
  }, [webrtcViewerCount, isConnected])

  useEffect(() => {
    // Load song requests
    loadSongRequests()

    // Set up real-time listeners for new song requests and messages
    const channel = supabase
      .channel(`stream:${stream.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "song_requests",
          filter: `stream_id=eq.${stream.id}`,
        },
        (payload) => {
          setSongRequests((prev) => [...prev, payload.new])
        },
      )
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

    return () => {
      supabase.removeChannel(channel)
      // Clean up media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream.id, supabase])

  async function loadSongRequests() {
    try {
      const requests = await getSongRequests(stream.id)
      setSongRequests(requests)
    } catch (error) {
      console.error("Error loading song requests:", error)
    }
  }

  async function handleStatusUpdate(newStatus: "scheduled" | "live" | "ended" | "cancelled") {
    setIsUpdating(true)
    try {
      const result = await updateStreamStatus(stream.id, newStatus)
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setStatus(newStatus)
        toast({
          title: "Success",
          description: `Stream is now ${newStatus}`,
        })

        if (newStatus === "live" && !isStreaming) {
          startStreaming()
        } else if (newStatus !== "live" && isStreaming) {
          stopStreaming()
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  async function startStreaming() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      })

      mediaStreamRef.current = stream
      setLocalStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      setIsStreaming(true)
    } catch (error) {
      console.error("Error accessing media devices:", error)
      toast({
        title: "Error",
        description: "Could not access camera or microphone",
        variant: "destructive",
      })
    }
  }

  function stopStreaming() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
      setLocalStream(null)
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }

    setIsStreaming(false)
  }

  function toggleMute() {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  function toggleVideo() {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsVideoEnabled(!isVideoEnabled)
    }
  }

  function handleQualityChange(quality: string) {
    setQualityLevel(quality as "high" | "medium" | "low" | "veryLow" | "auto")
  }

  async function handleSongRequestUpdate(requestId: string, newStatus: "pending" | "approved" | "played" | "rejected") {
    try {
      const result = await updateSongRequestStatus(requestId, newStatus)
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        // Update the local state
        setSongRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req)))

        toast({
          title: "Success",
          description: `Song request ${newStatus}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="bg-gradient-to-r from-orange-500 to-cyan-500 text-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{stream.title}</CardTitle>
                <CardDescription className="text-white/80">Stream Key: {stream.stream_key}</CardDescription>
              </div>
              <Badge variant={status === "live" ? "destructive" : "outline"} className="uppercase">
                {status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="aspect-video bg-black rounded-md overflow-hidden relative">
              {isStreaming ? (
                <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-white">Stream preview will appear here</p>
                </div>
              )}

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <Button
                  size="icon"
                  variant={isMuted ? "destructive" : "secondary"}
                  onClick={toggleMute}
                  disabled={!isStreaming}
                >
                  {isMuted ? <MicOff /> : <Mic />}
                </Button>

                <Button
                  size="icon"
                  variant={!isVideoEnabled ? "destructive" : "secondary"}
                  onClick={toggleVideo}
                  disabled={!isStreaming}
                >
                  {isVideoEnabled ? <Video /> : <VideoOff />}
                </Button>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                        disabled={!isStreaming}
                      >
                        <Settings />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Stream Quality Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {showAdvancedSettings && isStreaming && (
              <div className="mt-4 p-4 border rounded-md">
                <h3 className="text-lg font-medium mb-3">Stream Quality Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Quality Level</label>
                    <Select value={currentQuality} onValueChange={handleQualityChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (Adaptive)</SelectItem>
                        <SelectItem value="high">High (720p)</SelectItem>
                        <SelectItem value="medium">Medium (480p)</SelectItem>
                        <SelectItem value="low">Low (360p)</SelectItem>
                        <SelectItem value="veryLow">Very Low (240p)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentQuality === "auto"
                        ? "Automatically adjusts quality based on network conditions"
                        : "Manually set quality level"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Available Bandwidth</label>
                    <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                      {formatBandwidth(availableBandwidth)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Estimated upload bandwidth for your stream</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              <span>{viewerCount} viewers</span>
            </div>

            <div className="space-x-3">
              {status === "scheduled" && (
                <Button
                  onClick={() => handleStatusUpdate("live")}
                  disabled={isUpdating}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Go Live
                </Button>
              )}

              {status === "live" && (
                <Button onClick={() => handleStatusUpdate("ended")} disabled={isUpdating} variant="outline">
                  End Stream
                </Button>
              )}

              {status === "scheduled" && (
                <Button onClick={() => handleStatusUpdate("cancelled")} disabled={isUpdating} variant="outline">
                  Cancel
                </Button>
              )}
            </div>
          </CardFooter>
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
                    <p className="text-sm font-medium">Stream Quality</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {currentQuality === "auto" ? "Auto (Adaptive)" : currentQuality}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <Tabs defaultValue="requests">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="requests" className="flex items-center">
              <Music className="mr-2 h-4 w-4" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Song Requests</CardTitle>
                <CardDescription>Manage song requests from your audience</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {songRequests.length > 0 ? (
                    <div className="space-y-4">
                      {songRequests.map((request) => (
                        <div key={request.id} className="p-3 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{request.song_title}</h4>
                              <p className="text-sm text-muted-foreground">By {request.artist || "Unknown Artist"}</p>
                            </div>
                            <Badge
                              variant={
                                request.status === "pending"
                                  ? "outline"
                                  : request.status === "approved"
                                    ? "secondary"
                                    : request.status === "played"
                                      ? "default"
                                      : "destructive"
                              }
                            >
                              {request.status}
                            </Badge>
                          </div>

                          {request.message && <p className="text-sm mt-2 italic">"{request.message}"</p>}

                          <div className="flex justify-end mt-3 space-x-2">
                            {request.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSongRequestUpdate(request.id, "approved")}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSongRequestUpdate(request.id, "rejected")}
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                            {request.status === "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSongRequestUpdate(request.id, "played")}
                              >
                                Mark as Played
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No song requests yet</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>Messages from your audience</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
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
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No messages yet</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
