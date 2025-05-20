"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc, updateDoc, increment, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Mic, MicOff, VideoIcon, VideoOff } from "lucide-react"

interface RoomData {
  name: string
  description: string
  isPrivate: boolean
  members: string[]
}

export function VideoRoom({ roomId }: { roomId: string }) {
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const localVideoRef = useRef<HTMLVideoElement>(null)

  // Fetch room data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const roomRef = doc(db, "rooms", roomId)
        const roomSnap = await getDoc(roomRef)

        if (roomSnap.exists()) {
          setRoomData(roomSnap.data() as RoomData)
        } else {
          toast({
            variant: "destructive",
            title: "Room not found",
            description: "The video room you're looking for doesn't exist.",
          })
          router.push("/dashboard/video-rooms")
        }
      } catch (error) {
        console.error("Error fetching room data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoomData()
  }, [roomId, router, toast])

  // Update participant count when joining/leaving
  useEffect(() => {
    if (!user || !roomData) return

    const updateParticipants = async () => {
      const roomRef = doc(db, "rooms", roomId)

      // Increment participant count when joining
      await updateDoc(roomRef, {
        participants: increment(1),
      })

      // Decrement participant count when leaving
      return () => {
        updateDoc(roomRef, {
          participants: increment(-1),
        }).catch(console.error)
      }
    }

    const cleanup = updateParticipants()
    return () => {
      cleanup.then((fn) => fn && fn())
    }
  }, [user, roomId, roomData])

  // Initialize local video stream
  useEffect(() => {
    if (!user || !roomData) return

    let stream: MediaStream | null = null

    const initLocalStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled,
          audio: audioEnabled,
        })

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error("Error accessing media devices:", error)
        toast({
          variant: "destructive",
          title: "Media access error",
          description: "Could not access camera or microphone. Please check permissions.",
        })
      }
    }

    initLocalStream()

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [user, roomData, audioEnabled, videoEnabled, toast])

  const joinRoom = async () => {
    if (!user || !roomData) return

    setJoining(true)
    try {
      const roomRef = doc(db, "rooms", roomId)

      await updateDoc(roomRef, {
        members: arrayUnion(user.uid),
      })

      // Refresh room data
      const updatedRoomSnap = await getDoc(roomRef)
      setRoomData(updatedRoomSnap.data() as RoomData)

      toast({
        title: "Joined room",
        description: `You've joined the "${roomData.name}" video room.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join the room. Please try again.",
      })
    } finally {
      setJoining(false)
    }
  }

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)

    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !audioEnabled
      })
    }
  }

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled)

    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !videoEnabled
      })
    }
  }

  if (loading) {
    return <p>Loading video room...</p>
  }

  if (!roomData) {
    return <p>Video room not found</p>
  }

  // Check if user is a member of the room
  const isMember = user && roomData.members.includes(user.uid)

  // If the room is private and user is not a member, show join request
  if (roomData.isPrivate && !isMember) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <h2 className="text-2xl font-bold mb-4">{roomData.name}</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          This is a private video room. You need to join to participate.
        </p>
        <Button onClick={joinRoom} disabled={joining}>
          {joining ? "Joining..." : "Request to Join"}
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="border-b p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/video-rooms")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">{roomData.name}</h2>
          <p className="text-sm text-muted-foreground">{roomData.description}</p>
        </div>
      </div>

      <div className="flex-1 p-4 grid place-items-center">
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="rounded-lg border shadow-lg max-h-[70vh] max-w-full"
          />

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <Button variant="secondary" size="icon" className="rounded-full h-12 w-12" onClick={toggleAudio}>
              {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full h-12 w-12" onClick={toggleVideo}>
              {videoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={() => router.push("/dashboard/video-rooms")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
