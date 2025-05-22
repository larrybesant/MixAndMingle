"use client"

import { useState, useEffect } from "react"
import { getRealtimeDb } from "@/lib/firebase/realtime-database"
import { ref, onValue, off } from "firebase/database"
import { cn } from "@/lib/utils"

interface OnlineStatusIndicatorProps {
  userId: string
  className?: string
}

export default function OnlineStatusIndicator({ userId, className }: OnlineStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    if (!userId) return

    const db = getRealtimeDb()
    const userStatusRef = ref(db, `/status/${userId}`)

    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const status = snapshot.val()
      setIsOnline(status?.state === "online")
    })

    return () => {
      off(userStatusRef)
    }
  }, [userId])

  return (
    <div className="flex items-center">
      <div className={cn("h-2.5 w-2.5 rounded-full mr-1.5", isOnline ? "bg-green-500" : "bg-gray-300", className)} />
      <span className="text-xs text-muted-foreground">{isOnline ? "Online" : "Offline"}</span>
    </div>
  )
}
