"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Volume2, VolumeX, Maximize, Minimize } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createViewerPeer, sendSignal, subscribeToSignals } from "@/services/webrtc-service"
import { joinStream, leaveStream } from "@/services/stream-service"

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

  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerRef = useRef<any>(null)
  const signalUnsubscribeRef = useRef<() => void>(() => {})

  // Connect to stream
  const connectToStream = async () => {
    if (!user || isConnecting || isConnected) return

    try {
      setIsConnecting(true)

      // Join stream as viewer
      await joinStream(streamId, user.uid)

      // Create peer connection
      const peer = createViewerPeer(
        user.uid,
        (signal) => sendSignal(streamId, user.uid, djId, signal),
        (stream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream
          }
        },
        () => {
          console.log("Connected to broadcaster")
          setIsConnected(true)
          setIsConnecting(false)
        },
        () => {
          console.log("Disconnected from broadcaster")
          setIsConnected(false)
          setIsConnecting(false)
        },
        (err) => {
          console.error("Error with broadcaster:", err)
          setIsConnected(false)
          setIsConnecting(false)
          toast({
            title: "Connection Error",
            description: "Failed to connect to the stream",
            variant: "destructive",
          })
        },
      )

      peerRef.current = peer

      // Subscribe to signals from broadcaster
      const unsubscribe = subscribeToSignals(streamId, user.uid, (fromUserId, signal) => {
        if (fromUserId === djId && peer) {
          peer.signal(signal)
        }
      })

      signalUnsubscribeRef.current = unsubscribe
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
      await leaveStream(streamId, user.uid)

      // Destroy peer connection
      if (peerRef.current) {
        peerRef.current.destroy()
        peerRef.current = null
      }

      // Unsubscribe from signals
      signalUnsubscribeRef.current()

      setIsConnected(false)
    } catch (error) {
      console.error("Error disconnecting from stream:", error)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!remoteVideoRef.current) return

    if (!isFullscreen) {
      if (remoteVideoRef.current.requestFullscreen) {
        remoteVideoRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnectFromStream()
    }
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="aspect-video bg-black rounded-md overflow-hidden relative">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-lg">
                  {isConnecting ? "Connecting to stream..." : "Not connected to stream"}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className={`${isMuted ? "bg-red-900 hover:bg-red-800" : "bg-gray-800 hover:bg-gray-700"}`}
                onClick={toggleMute}
                disabled={!isConnected}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
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
