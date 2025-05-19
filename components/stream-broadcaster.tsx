"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useBroadcaster } from "@/services/webrtc-service"
import { Mic, MicOff, Video, VideoOff, Users, ScreenShare, StopCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StreamBroadcasterProps {
  streamId: string
  userId: string
  title: string
}

export function StreamBroadcaster({ streamId, userId, title }: StreamBroadcasterProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)

  const { startBroadcast, stopBroadcast, isLive, viewerCount, error, stream } = useBroadcaster(streamId, userId)

  // Connect stream to video element when available
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Toggle microphone
  const toggleMicrophone = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  // Toggle camera
  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsVideoEnabled(!isVideoEnabled)
    }
  }

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop())
        setScreenStream(null)
      }

      // Restart camera if video is enabled
      if (stream && isVideoEnabled) {
        const videoTracks = stream.getVideoTracks()
        videoTracks.forEach((track) => {
          track.enabled = true
        })
      }

      setIsScreenSharing(false)
    } else {
      try {
        // Start screen sharing
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })

        setScreenStream(displayStream)

        // Replace video track with screen share track
        if (stream) {
          const videoTrack = displayStream.getVideoTracks()[0]

          const senders = stream.getTracks()
          senders.forEach((sender) => {
            if (sender.kind === "video") {
              sender.stop()
            }
          })

          stream.addTrack(videoTrack)

          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        }

        setIsScreenSharing(true)

        // Handle when user stops screen sharing via browser UI
        displayStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare()
        }
      } catch (err) {
        console.error("Error starting screen share:", err)
      }
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          {isLive && (
            <Badge variant="destructive" className="animate-pulse">
              LIVE
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video bg-black rounded-md overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

          {!isLive && !stream && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <p className="text-xl font-semibold">Ready to go live</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {isLive && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-md">
              <Users size={16} />
              <span>{viewerCount}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex justify-center gap-2 w-full">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMicrophone}
            className={isMuted ? "bg-red-100 hover:bg-red-200" : ""}
          >
            {isMuted ? <MicOff /> : <Mic />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleVideo}
            className={!isVideoEnabled ? "bg-red-100 hover:bg-red-200" : ""}
          >
            {isVideoEnabled ? <Video /> : <VideoOff />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleScreenShare}
            className={isScreenSharing ? "bg-blue-100 hover:bg-blue-200" : ""}
          >
            {isScreenSharing ? <StopCircle /> : <ScreenShare />}
          </Button>
        </div>

        <Button
          variant={isLive ? "destructive" : "default"}
          className="w-full"
          onClick={isLive ? stopBroadcast : startBroadcast}
        >
          {isLive ? "End Stream" : "Go Live"}
        </Button>
      </CardFooter>
    </Card>
  )
}
