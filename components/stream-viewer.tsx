"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useViewer } from "@/services/webrtc-service"
import { Volume2, VolumeX, Maximize, Minimize, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StreamViewerProps {
  streamId: string
  broadcasterId: string
  userId: string
  title: string
}

export function StreamViewer({ streamId, broadcasterId, userId, title }: StreamViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const { connectToStream, disconnectFromStream, stream, isConnected, error } = useViewer(
    streamId,
    broadcasterId,
    userId,
  )

  // Connect to stream on component mount
  useEffect(() => {
    connectToStream()

    return () => {
      disconnectFromStream()
    }
  }, [])

  // Connect stream to video element when available
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Toggle audio
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Reconnect to stream
  const handleReconnect = () => {
    disconnectFromStream()
    setTimeout(() => {
      connectToStream()
    }, 1000)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          {isConnected && (
            <Badge variant="destructive" className="animate-pulse">
              LIVE
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="relative aspect-video bg-black rounded-md overflow-hidden">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />

          {!isConnected && !stream && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <p className="text-xl font-semibold">Connecting to stream...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white flex-col gap-4">
              <p className="text-red-500">{error}</p>
              <Button onClick={handleReconnect} size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reconnect
              </Button>
            </div>
          )}

          {isConnected && (
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="bg-black/60 border-none hover:bg-black/80 text-white"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="bg-black/60 border-none hover:bg-black/80 text-white"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-between">
          <Button variant="outline" onClick={handleReconnect}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Stream
          </Button>

          <Button variant="destructive" onClick={disconnectFromStream}>
            Leave Stream
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
