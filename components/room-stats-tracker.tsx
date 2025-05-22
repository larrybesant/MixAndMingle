"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { roomStats, djActivity } from "@/lib/firebase/realtime-database"
import { useRoomPresence } from "@/hooks/use-room-presence"

interface RoomStatsTrackerProps {
  roomId: string
  djId: string
  isPlaying: boolean
  currentTrack?: {
    id: string
    name: string
  }
}

export default function RoomStatsTracker({ roomId, djId, isPlaying, currentTrack }: RoomStatsTrackerProps) {
  const { user } = useAuth()
  const { userCount } = useRoomPresence(roomId)

  // Update room stats when listener count changes
  useEffect(() => {
    if (!roomId) return

    roomStats.updateStats(roomId, {
      listenerCount: userCount,
    })
  }, [roomId, userCount])

  // Track DJ activity when track changes
  useEffect(() => {
    if (!djId || !currentTrack || !isPlaying) return

    djActivity.trackActivity(djId, "track_change", {
      trackId: currentTrack.id,
      trackName: currentTrack.name,
      roomId,
    })
  }, [djId, currentTrack, isPlaying, roomId])

  // This component doesn't render anything visible
  return null
}
