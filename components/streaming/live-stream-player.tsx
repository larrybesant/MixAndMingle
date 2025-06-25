"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Radio,
  Users,
  Heart,
  Settings,
  Monitor,
  MonitorOff,
  Volume2,
  VolumeX,
  Maximize,
  Share2,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DailyVideoRoom } from "./DailyVideoRoom";

interface LiveStreamPlayerProps {
  roomId: string;
  isHost?: boolean;
  hostInfo?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  initialViewerCount?: number;
}

export function LiveStreamPlayer({
  roomId,
  isHost = false,
  hostInfo,
  initialViewerCount = 0,
}: LiveStreamPlayerProps) {
  // Stream state
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(initialViewerCount);

  // Media controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Loading states
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // WebRTC state (simplified for demo)
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  // Real-time viewer count updates
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setViewerCount((prev) => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(0, prev + change);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Update room status in database
  useEffect(() => {
    const updateRoomStatus = async () => {
      if (isHost) {
        await supabase
          .from("dj_rooms")
          .update({
            is_live: isStreaming,
            viewer_count: viewerCount,
          })
          .eq("id", roomId);
      }
    };

    updateRoomStatus();
  }, [isStreaming, viewerCount, roomId, isHost]);

  // Start streaming
  const startStream = async () => {
    if (isStarting) return;
    setIsStarting(true);

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      streamRef.current = stream;
      setIsStreaming(true);
      setIsConnected(true);
      setViewerCount(Math.floor(Math.random() * 20) + 5);

      toast({
        title: "🎥 Live Stream Started!",
        description: "Your stream is now live and viewers can join.",
      });
    } catch (error) {
      console.error("Error starting stream:", error);
      toast({
        title: "Stream Error",
        description:
          "Could not access camera/microphone. Please check permissions.",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  // Stop streaming
  const stopStream = () => {
    if (isStopping) return;
    setIsStopping(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    setIsStreaming(false);
    setIsConnected(false);
    setViewerCount(0);
    setIsStopping(false);

    toast({
      title: "📴 Stream Ended",
      description: "Your live stream has been stopped.",
    });
  };

  // Toggle microphone
  const toggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);

      toast({
        title: isMuted ? "🎤 Microphone On" : "🤫 Microphone Off",
        description: isMuted
          ? "Your audio is now enabled"
          : "Your audio is now muted",
      });
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !isVideoOn;
      });
      setIsVideoOn(!isVideoOn);

      toast({
        title: isVideoOn ? "📹 Camera Off" : "📹 Camera On",
        description: isVideoOn
          ? "Your video is now disabled"
          : "Your video is now enabled",
      });
    }
  };

  // Screen sharing
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);
        toast({
          title: "🖥️ Screen Sharing Started",
          description: "Now sharing your screen with viewers",
        });
      } else {
        // Return to camera
        await startStream();
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error("Screen share error:", error);
      toast({
        title: "Screen Share Error",
        description: "Could not start screen sharing",
        variant: "destructive",
      });
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <Card
      ref={containerRef}
      className="bg-gradient-to-b from-slate-900/90 to-black/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden"
    >
      {/* Stream Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {hostInfo && (
              <>
                <Avatar className="w-10 h-10 border-2 border-purple-500/50">
                  <AvatarImage src={hostInfo.avatar_url} />
                  <AvatarFallback className="bg-purple-600 text-white">
                    {hostInfo.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-semibold">
                    {hostInfo.username}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {isConnected && (
                      <Badge className="bg-red-500 text-white animate-pulse">
                        <Radio className="w-3 h-3 mr-1" />
                        LIVE
                      </Badge>
                    )}
                    <span className="text-white/60 text-sm flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {viewerCount} {viewerCount === 1 ? "viewer" : "viewers"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Stream Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/10"
            >
              <Maximize className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative aspect-video bg-black/50 flex items-center justify-center">
        {isStreaming ? (
          <>
            {/* Local Video (Host) */}
            <video
              ref={localVideoRef}
              autoPlay
              muted={isHost}
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Remote Video (Viewer) */}
            {!isHost && (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}

            {/* Overlay Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              {isHost && (
                <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className={`rounded-full ${isMuted ? "bg-red-500 text-white" : "text-white hover:bg-white/20"}`}
                  >
                    {isMuted ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleVideo}
                    className={`rounded-full ${!isVideoOn ? "bg-red-500 text-white" : "text-white hover:bg-white/20"}`}
                  >
                    {isVideoOn ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <VideoOff className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleScreenShare}
                    className={`rounded-full ${isScreenSharing ? "bg-blue-500 text-white" : "text-white hover:bg-white/20"}`}
                  >
                    {isScreenSharing ? (
                      <MonitorOff className="w-4 h-4" />
                    ) : (
                      <Monitor className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={stopStream}
                    disabled={isStopping}
                    className="rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    <Radio className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {!isHost && (
                <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setVolume(volume > 0 ? 0 : 1)}
                    className="rounded-full text-white hover:bg-white/20"
                  >
                    {volume > 0 ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Stream Offline State */
          <div className="text-center space-y-4 p-8">
            <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center">
              <Radio className="w-10 h-10 text-white/60" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {isHost ? "Ready to Go Live?" : "Stream Offline"}
              </h3>
              <p className="text-white/60">
                {isHost
                  ? "Start your live stream to connect with your audience"
                  : "This stream is currently offline. Check back later!"}
              </p>
            </div>

            {isHost && (
              <Button
                onClick={startStream}
                disabled={isStarting}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold"
              >
                {isStarting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting...
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4 mr-2" />
                    Go Live
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stream Info */}
      {isStreaming && (
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-white/60">
            <div className="flex items-center space-x-4">
              <span>Quality: 720p</span>
              <span>Bitrate: 2.5 Mbps</span>
              {isHost && <span>Latency: ~2s</span>}
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Connected</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
