"use client"

import { useRoomPresence } from "@/hooks/use-room-presence"
import { Users } from "lucide-react"

interface RoomPresenceIndicatorProps {
  roomId: string
  showCount?: boolean
  showText?: boolean
  className?: string
}

export function RoomPresenceIndicator({
  roomId,
  showCount = true,
  showText = true,
  className = "",
}: RoomPresenceIndicatorProps) {
  const { onlineCount, loading, error } = useRoomPresence(roomId)

  if (loading) {
    return (
      <div className={`flex items-center text-gray-500 ${className}`}>
        <Users className="h-4 w-4 mr-1" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (error) {
    return null // Don't show anything on error
  }

  return (
    <div className={`flex items-center text-gray-700 ${className}`}>
      <Users className="h-4 w-4 mr-1" />
      {showCount && <span className="text-sm font-medium mr-1">{onlineCount}</span>}
      {showText && <span className="text-sm">{onlineCount === 1 ? "person" : "people"} listening</span>}
    </div>
  )
}
