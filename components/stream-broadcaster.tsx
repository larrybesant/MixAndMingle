"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, MicOff, Video, VideoOff, ScreenShare, StopCircle, Settings, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { startStream, endStream } from "@/services/stream-service"

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
  const [isRecording, setIsRecording] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [audioLevel, setAudioLevel] = useState(100)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("")
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("")
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({})
  const audioAnalyserRef = useRef<AnalyserNode | null>(null)
  const audioLevelIntervalRef = useRef<number | null>(null)

  // Initialize media devices
  useEffect(() => {
    const getMediaDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoInputs = devices.filter((device) => device.kind === "videoinput")
        const audioInputs = devices.filter((device) => device.kind === "audioinput")

        setVideoDevices(videoInputs)
        setAudioDevices(audioInputs)

        if (videoInputs.length > 0 && !selectedVideoDevice) {
          setSelectedVideoDevice(videoInputs[0].deviceId)
        }

        if (audioInputs.length > 0 && !selectedAudioDevice) {
          setSelectedAudioDevice(audioInputs[0].deviceId)
        }
      } catch (error) {
        console.error("Error getting media devices:", error)
        toast({
          title: "Error",
          description: "Could not access media devices",
          variant: "destructive",
        })
      }
    }

    getMediaDevices()

    // Listen for device changes
    navigator.mediaDevices.addEventListener("devicechange", getMediaDevices)

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getMediaDevices)
    }
  }, [toast])

  // Initialize media stream
  useEffect(() => {
    const initMediaStream = async () => {
      try {
        if (mediaStreamRef.current) {
          // Stop all tracks in the current stream
          mediaStreamRef.current.getTracks().forEach((track) => track.stop())
        }

        const constraints: MediaStreamConstraints = {
          audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
          video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        mediaStreamRef.current = stream

        // Set up audio analyzer for volume meter
        if (stream.getAudioTracks().length > 0) {
          const audioContext = new AudioContext()
          const audioSource = audioContext.createMediaStreamSource(stream)
          const analyser = audioContext.createAnalyser()
          analyser.fftSize = 256
          audioSource.connect(analyser)
          audioAnalyserRef.current = analyser

          // Start monitoring audio level
          startAudioLevelMonitoring()
        }

        // Apply initial mute state
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !isMuted
        })

        // Apply initial video state
        stream.getVideoTracks().forEach((track) => {
          track.enabled = isVideoEnabled
        })

        // Set the stream as the source for the video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error("Error initializing media stream:", error)
        toast({
          title: "Error",
          description: "Could not access camera or microphone",
          variant: "destructive",
        })
      }
    }

    if (selectedVideoDevice || selectedAudioDevice) {
      initMediaStream()
    }

    return () => {
      // Clean up
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop())
      }

      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current)
      }
    }
  }, [selectedVideoDevice, selectedAudioDevice, isMuted, isVideoEnabled, toast])

  // Monitor audio level
  const startAudioLevelMonitoring = () => {
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current)
    }

    audioLevelIntervalRef.current = window.setInterval(() => {
      if (audioAnalyserRef.current) {
        const dataArray = new Uint8Array(audioAnalyserRef.current.frequencyBinCount)
        audioAnalyserRef.current.getByteFrequencyData(dataArray)

        // Calculate average volume
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length

        // Map to 0-100 range
        const level = Math.min(100, Math.max(0, Math.round((average / 255) * 100)))
        setAudioLevel(level)
      }
    }, 100)
  }

  // Toggle live status
  const toggleLiveStatus = async () => {
    if (!user || !mediaStreamRef.current) {
      toast({
        title: "Error",
        description: "Media stream not available",
        variant: "destructive",
      })
      return
    }

    try {
      if (isLive) {
        // End the stream
        await endStream(streamId, user.uid)

        // Stop recording if active
        if (isRecording) {
          stopRecording()
        }

        // Close all peer connections
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          pc.close()
        })
        peerConnectionsRef.current = {}

        setIsLive(false)
        setViewerCount(0)

        toast({
          title: "Stream ended",
          description: "Your stream has been ended successfully",
        })
      } else {
        // Start the stream
        await startStream(streamId, user.uid)
        setIsLive(true)

        toast({
          title: "Stream started",
          description: "You are now live!",
        })
      }
    } catch (error) {
      console.error("Error toggling stream status:", error)
      toast({
        title: "Error",
        description: "Failed to update stream status",
        variant: "destructive",
      })
    }
  }

  // Toggle microphone
  const toggleMicrophone = () => {
    if (!mediaStreamRef.current) return

    const audioTracks = mediaStreamRef.current.getAudioTracks()
    audioTracks.forEach((track) => {
      track.enabled = isMuted
    })

    setIsMuted(!isMuted)
  }

  // Toggle camera
  const toggleCamera = () => {
    if (!mediaStreamRef.current) return

    const videoTracks = mediaStreamRef.current.getVideoTracks()
    videoTracks.forEach((track) => {
      track.enabled = !isVideoEnabled
    })

    setIsVideoEnabled(!isVideoEnabled)
  }

  // Toggle screen sharing
  const toggleScreenSharing = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((track) => track.stop())
          screenStreamRef.current = null
        }

        // Switch back to camera
        if (localVideoRef.current && mediaStreamRef.current) {
          localVideoRef.current.srcObject = mediaStreamRef.current
        }

        setIsScreenSharing(false)
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        screenStreamRef.current = screenStream

        // Display screen share in local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }

        // Handle when user stops screen sharing via browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenSharing()
        }

        setIsScreenSharing(true)
      }
    } catch (error) {
      console.error("Error toggling screen sharing:", error)
      toast({
        title: "Error",
        description: "Failed to share screen",
        variant: "destructive",
      })
    }
  }

  // Start recording
  const startRecording = () => {
    if (!mediaStreamRef.current) return

    try {
      recordedChunksRef.current = []

      const stream = isScreenSharing && screenStreamRef.current ? screenStreamRef.current : mediaStreamRef.current

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" })
        const url = URL.createObjectURL(blob)

        // Create a download link
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `stream-recording-${new Date().toISOString()}.webm`
        document.body.appendChild(a)
        a.click()

        // Clean up
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, 100)
      }

      mediaRecorder.start(1000) // Collect data every second
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)

      toast({
        title: "Recording started",
        description: "Your stream is now being recorded",
      })
    } catch (error) {
      console.error("Error starting recording:", error)
      toast({
        title: "Error",
        description: "Failed to start recording",
        variant: "destructive",
      })
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      toast({
        title: "Recording stopped",
        description: "Your recording has been saved",
      })
    }
  }

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // Audio level indicator
  const AudioLevelIndicator = () => {
    const levelColors = ["bg-green-500", "bg-green-500", "bg-green-500", "bg-yellow-500", "bg-yellow-500", "bg-red-500"]

    const getColorForLevel = (level: number) => {
      const index = Math.floor(level / 20)
      return levelColors[Math.min(index, levelColors.length - 1)]
    }

    return (
      <div className="flex items-center gap-2">
        <Mic className="h-4 w-4 text-muted-foreground" />
        <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getColorForLevel(audioLevel)} transition-all duration-100`}
            style={{ width: `${audioLevel}%` }}
          />
        </div>
      </div>
    )
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

            {isRecording && (
              <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-sm font-medium flex items-center gap-1">
                <StopCircle className="w-4 h-4" />
                REC
              </div>
            )}

            {isLive && (
              <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {viewerCount}
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

              <Button
                variant="outline"
                size="icon"
                className={`${isRecording ? "bg-red-900 hover:bg-red-800" : "bg-gray-800 hover:bg-gray-700"}`}
                onClick={toggleRecording}
              >
                <StopCircle className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="bg-gray-800 hover:bg-gray-700"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <AudioLevelIndicator />

              <Button
                className={isLive ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                onClick={toggleLiveStatus}
              >
                {isLive ? "End Stream" : "Go Live"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showSettings && (
        <Card>
          <CardContent className="p-4">
            <Tabs defaultValue="devices">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="devices">Devices</TabsTrigger>
                <TabsTrigger value="stream">Stream Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="devices" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="videoDevice">Camera</Label>
                  <select
                    id="videoDevice"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background"
                    value={selectedVideoDevice}
                    onChange={(e) => setSelectedVideoDevice(e.target.value)}
                  >
                    {videoDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audioDevice">Microphone</Label>
                  <select
                    id="audioDevice"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background"
                    value={selectedAudioDevice}
                    onChange={(e) => setSelectedAudioDevice(e.target.value)}
                  >
                    {audioDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              </TabsContent>

              <TabsContent value="stream" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="recordStream">Record Stream</Label>
                  <Switch
                    id="recordStream"
                    checked={isRecording}
                    onCheckedChange={toggleRecording}
                    disabled={!isLive}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="audioLevel">Microphone Volume</Label>
                    <span>{audioLevel}%</span>
                  </div>
                  <Slider
                    id="audioLevel"
                    min={0}
                    max={100}
                    step={1}
                    value={[audioLevel]}
                    onValueChange={(value) => setAudioLevel(value[0])}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
