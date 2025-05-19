"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX, Maximize, Minimize, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { joinStream, leaveStream } from "@/services/stream-service"
import { createPeerConnection } from "@/utils/webrtc-utils"

interface StreamViewerProps {
  streamId: string
  djId: string
}

export function StreamViewer({ streamId, djId }: StreamViewerProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolume] = useState(100)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnectFromStream()
    }
  }, [])

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Update volume when slider changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100
    }
  }, [volume])

  // Connect to stream
  const connectToStream = async () => {
    if (!user || isConnecting || isConnected) return

    try {
      setIsConnecting(true)

      // Join stream as viewer
      await joinStream(streamId, user.uid)

      // Create peer connection
      const peerConnection = createPeerConnection({
        onTrack: (event) => {
          if (videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0]
          }
        },
        onConnectionStateChange: (state) => {
          if (state === "connected") {
            setIsConnected(true)
            setIsConnecting(false)
          } else if (state === "disconnected" || state === "failed" || state === "closed") {
            setIsConnected(false)
            setIsConnecting(false)
          }
        },
        onError: (error) => {
          console.error("Peer connection error:", error)
          setIsConnected(false)
          setIsConnecting(false)
          toast({
            title: "Connection Error",
            description: "Failed to connect to the stream",
            variant: "destructive",
          })
        },
      })

      peerConnectionRef.current = peerConnection

      // TODO: Implement signaling to exchange SDP with the broadcaster
      // This would typically involve:
      // 1. Sending a request to the broadcaster
      // 2. Receiving an offer
      // 3. Creating an answer
      // 4. Exchanging ICE candidates

      // For now, we'll simulate a successful connection
      setTimeout(() => {
        setIsConnected(true)
        setIsConnecting(false)
        setViewerCount(Math.floor(Math.random() * 20) + 1) // Simulated viewer count
      }, 2000)
    } catch (error) {
      console.error("Error connecting to stream:", error)
      setIsConnecting(false)
      toast({
        title: "Connection Error",
        description: "Failed to connect to the stream",
        variant: "destructive",
      })
    }
  }

  // Disconnect from stream
  const disconnectFromStream = async () => {
    if (!user || !isConnected) return

    try {
      // Leave stream as viewer
      if (user) {
        await leaveStream(streamId, user.uid)
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }

      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }

      setIsConnected(false)
    } catch (error) {
      console.error("Error disconnecting from stream:", error)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!videoRef.current) return

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="aspect-video bg-black rounded-md overflow-hidden relative">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />

            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-lg">
                  {isConnecting ? "Connecting to stream..." : "Not connected to stream"}
                </p>
              </div>
            )}

            {isConnected && (
              <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
                <Users className="w-4 h-4" />
                {viewerCount}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className={`${isMuted ? "bg-red-900 hover:bg-red-800" : "bg-gray-800 hover:bg-gray-700"}`}
                  onClick={toggleMute}
                  disabled={!isConnected}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                {showVolumeSlider && (
                  <div
                    className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 rounded-md w-32"
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <Slider
                      value={[volume]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => setVolume(value[0])}
                    />
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="bg-gray-800 hover:bg-gray-700"
                onClick={toggleFullscreen}
                disabled={!isConnected}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>

            {isConnected ? (
              <Button className="bg-red-600 hover:bg-red-700" onClick={disconnectFromStream}>
                Disconnect
              </Button>
            ) : (
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={connectToStream} disabled={isConnecting}>
                {isConnecting ? "Connecting..." : "Connect to Stream"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
