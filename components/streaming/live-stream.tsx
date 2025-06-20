"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Video, VideoOff, Radio, Users, Heart } from "lucide-react"

interface LiveStreamProps {
  isHost?: boolean
  roomId: string
}

export function LiveStream({ isHost = false, roomId }: LiveStreamProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Simulate viewer count updates
    const interval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 3) - 1)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      streamRef.current = stream
      setIsStreaming(true)
      setViewerCount(Math.floor(Math.random() * 50) + 10)
    } catch (error) {
      console.error("Error accessing media devices:", error)
      alert("Could not access camera/microphone. Please check permissions.")
    }
  }

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsStreaming(false)
    setViewerCount(0)
  }

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !isVideoOn
      })
      setIsVideoOn(!isVideoOn)
    }
  }

  // --- WebRTC Signaling Scaffold ---
  // This is a placeholder for real WebRTC signaling using Supabase Realtime.
  // TODO: Implement offer/answer exchange and ICE candidate relay via Supabase channel.
  // TODO: On host, create offer and publish to channel. On viewer, listen for offer and send answer.
  // TODO: On both, exchange ICE candidates for NAT traversal.
  // TODO: Attach remote stream to video element for viewers.
  // Example:
  // const signalingChannel = supabase.channel(`webrtc-room-${roomId}`);
  // signalingChannel.on('broadcast', { event: 'offer' }, (payload) => { ... });
  // signalingChannel.send({ type: 'broadcast', event: 'offer', payload: { ... } });
  // ...existing code...

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
      {/* Stream Display */}
      <div className="relative mb-6">
        <video
          ref={videoRef}
          autoPlay
          muted={!isHost}
          className="w-full h-64 lg:h-96 bg-black rounded-2xl object-cover"
          style={{ transform: isHost ? "scaleX(-1)" : "none" }}
        />

        {/* Live Indicator */}
        {isStreaming && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            LIVE
          </div>
        )}

        {/* Viewer Count */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
          <Users className="w-4 h-4" />
          {viewerCount.toLocaleString()}
        </div>

        {/* Stream Overlay */}
        {!isStreaming && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <Radio className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 text-lg">{isHost ? "Ready to go live?" : "Waiting for user to start..."}</p>
            </div>
          </div>
        )}
      </div>

      {/* Host Controls */}
      {isHost && (
        <div className="flex flex-wrap gap-4 justify-center">
          {!isStreaming ? (
            <button
              onClick={startStream}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Radio className="w-5 h-5" />
              Go Live
            </button>
          ) : (
            <>
              <button
                onClick={stopStream}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                End Stream
              </button>

              <button
                onClick={toggleMute}
                className={`${
                  isMuted ? "bg-gradient-to-r from-red-600 to-red-700" : "bg-gradient-to-r from-green-600 to-green-700"
                } hover:opacity-80 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                {isMuted ? "Unmute" : "Mute"}
              </button>

              <button
                onClick={toggleVideo}
                className={`${
                  !isVideoOn ? "bg-gradient-to-r from-red-600 to-red-700" : "bg-gradient-to-r from-blue-600 to-blue-700"
                } hover:opacity-80 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2`}
              >
                {!isVideoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                {!isVideoOn ? "Camera Off" : "Camera On"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Viewer Actions */}
      {!isHost && isStreaming && (
        <div className="flex gap-4 justify-center">
          <button className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Send Love
          </button>
        </div>
      )}
    </div>
  )
}
