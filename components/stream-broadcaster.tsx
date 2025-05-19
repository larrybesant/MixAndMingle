"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Video, VideoOff, ScreenShare, StopCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getUserMedia,
  getDisplayMedia,
  stopMediaStream,
  createBroadcasterPeer,
  sendSignal,
  subscribeToSignals,
  type SignalData,
} from "@/services/webrtc-service"
import { startStream, endStream, getStreamViewers } from "@/services/stream-service"

interface StreamBroadcasterProps {
  streamId: string
  djId: string
}

export function StreamBroadcaster({ streamId, djId }: StreamBroadcasterProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLive, setIsLive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [viewers, setViewers] = useState<any[]>([])
  const [viewerCount, setViewerCount] = useState(0)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionsRef = useRef<{ [userId: string]: any }>({})
  const signalUnsubscribeRef = useRef<() => void>(() => {})

  // Initialize local stream
  useEffect(() => {
    const initLocalStream = async () => {
      const stream = await getUserMedia(isVideoEnabled, !isMuted)
      if (stream) {
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      } else {
        toast({
          title: "Media Error",
          description: "Could not access camera or microphone",
          variant: "destructive",
        })
      }
    }

    initLocalStream()

    return () => {
      stopMediaStream(localStreamRef.current)
      stopMediaStream(screenStreamRef.current)
      Object.values(peerConnectionsRef.current).forEach((peer) => {
        if (peer) peer.destroy()
      })
      signalUnsubscribeRef.current()
    }
  }, [])

  // Subscribe to signals when live
  useEffect(() => {
    if (isLive && user) {
      const unsubscribe = subscribeToSignals(streamId, user.uid, handleIncomingSignal)
      signalUnsubscribeRef.current = unsubscribe

      // Fetch viewers periodically
      const interval = setInterval(fetchViewers, 10000)
      return () => {
        clearInterval(interval)
        unsubscribe()
      }
    }
  }, [isLive, streamId, user])

  // Fetch viewers
  const fetchViewers = async () => {
    if (!isLive) return
    try {
      const viewers = await getStreamViewers(streamId)
      setViewers(viewers)
      setViewerCount(viewers.length)
    } catch (error) {
      console.error("Error fetching viewers:", error)
    }
  }

  // Handle incoming signals from viewers
  const handleIncomingSignal = async (fromUserId: string, signal: SignalData) => {
    if (!user || !localStreamRef.current) return

    // If we don't have a peer connection for this user yet, create one
    if (!peerConnectionsRef.current[fromUserId]) {
      const peer = createBroadcasterPeer(
        isScreenSharing ? screenStreamRef.current! : localStreamRef.current,
        user.uid,
        (signal) => sendSignal(streamId, user.uid, fromUserId, signal),
        () => console.log(`Connected to viewer ${fromUserId}`),
        () => {
          console.log(`Disconnected from viewer ${fromUserId}`)
          delete peerConnectionsRef.current[fromUserId]
          fetchViewers()
        },
        (err) => console.error(`Error with viewer ${fromUserId}:`, err),
      )
      peerConnectionsRef.current[fromUserId] = peer
    }

    // Signal the peer
    peerConnectionsRef.current[fromUserId].signal(signal)
  }

  // Toggle stream status
  const toggleLiveStatus = async () => {
    if (!user || !localStreamRef.current) return

    if (isLive) {
      // End stream
      try {
        await endStream(streamId)
        setIsLive(false)

        // Destroy all peer connections
        Object.values(peerConnectionsRef.current).forEach((peer) => {
          if (peer) peer.destroy()
        })
        peerConnectionsRef.current = {}

        toast({
          title: "Stream Ended",
          description: "Your live stream has ended",
        })
      } catch (error) {
        console.error("Error ending stream:", error)
        toast({
          title: "Error",
          description: "Failed to end stream",
          variant: "destructive",
        })
      }
    } else {
      // Start stream
      try {
        await startStream(streamId)
        setIsLive(true)
        toast({
          title: "Stream Started",
          description: "You are now live!",
        })
      } catch (error) {
        console.error("Error starting stream:", error)
        toast({
          title: "Error",
          description: "Failed to start stream",
          variant: "destructive",
        })
      }
    }
  }

  // Toggle microphone
  const toggleMicrophone = () => {
    if (!localStreamRef.current) return

    const audioTracks = localStreamRef.current.getAudioTracks()
    audioTracks.forEach((track) => {
      track.enabled = isMuted
    })
    setIsMuted(!isMuted)
  }

  // Toggle camera
  const toggleCamera = async () => {
    if (!localStreamRef.current) return

    if (isVideoEnabled) {
      // Disable video
      const videoTracks = localStreamRef.current.getVideoTracks()
      videoTracks.forEach((track) => {
        track.stop()
      })
      setIsVideoEnabled(false)
    } else {
      // Enable video
      stopMediaStream(localStreamRef.current)
      const newStream = await getUserMedia(true, !isMuted)
      if (newStream) {
        localStreamRef.current = newStream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream
        }
        setIsVideoEnabled(true)
      }
    }
  }

  // Toggle screen sharing
  const toggleScreenSharing = async () => {
    if (!user) return

    if (isScreenSharing) {
      // Stop screen sharing
      stopMediaStream(screenStreamRef.current)
      screenStreamRef.current = null

      // Switch back to camera
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current
      }

      // Update all peer connections to use camera stream
      if (isLive && localStreamRef.current) {
        Object.values(peerConnectionsRef.current).forEach((peer) => {
          if (peer) {
            peer.removeStream(screenStreamRef.current!)
            peer.addStream(localStreamRef.current!)
          }
        })
      }

      setIsScreenSharing(false)
    } else {
      // Start screen sharing
      const screenStream = await getDisplayMedia()
      if (screenStream) {
        screenStreamRef.current = screenStream

        // Display screen share in local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }

        // Update all peer connections to use screen share stream
        if (isLive) {
          Object.values(peerConnectionsRef.current).forEach((peer) => {
            if (peer) {
              peer.removeStream(localStreamRef.current!)
              peer.addStream(screenStream)
            }
          })
        }

        // Handle when user stops screen sharing via browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenSharing()
        }

        setIsScreenSharing(true)
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="aspect-video bg-black rounded-md overflow-hidden relative">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isVideoEnabled && !isScreenSharing ? "hidden" : ""}`}
            />
            {!isVideoEnabled && !isScreenSharing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-lg">Camera is off</p>
              </div>
            )}
            {isLive && (
              <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-md text-sm font-medium flex items-center gap-1">
                <StopCircle className="w-4 h-4" />
                LIVE
              </div>
            )}
            {isLive && viewerCount > 0 && (
              <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md text-sm">
                {viewerCount} {viewerCount === 1 ? "viewer" : "viewers"}
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className={`${isMuted ? "bg-red-900 hover:bg-red-800" : "bg-gray-800 hover:bg-gray-700"}`}
                onClick={toggleMicrophone}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`${!isVideoEnabled ? "bg-red-900 hover:bg-red-800" : "bg-gray-800 hover:bg-gray-700"}`}
                onClick={toggleCamera}
              >
                {!isVideoEnabled ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`${isScreenSharing ? "bg-blue-900 hover:bg-blue-800" : "bg-gray-800 hover:bg-gray-700"}`}
                onClick={toggleScreenSharing}
              >
                <ScreenShare className="h-5 w-5" />
              </Button>
            </div>

            <Button
              className={isLive ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
              onClick={toggleLiveStatus}
            >
              {isLive ? "End Stream" : "Go Live"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
