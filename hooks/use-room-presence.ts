"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { roomPresence } from "@/lib/firebase/realtime-database"

export function useRoomPresence(roomId: string) {
  const { user } = useAuth()
  const [roomUsers, setRoomUsers] = useState<Record<string, any>>({})
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    if (!roomId) return

    // Get all users in the room
    const unsubscribe = roomPresence.getUsers(roomId, (users) => {
      setRoomUsers(users)
      setUserCount(Object.keys(users).length)
    })

    return () => {
      unsubscribe()
    }
  }, [roomId])

  useEffect(() => {
    if (!user || !roomId) return

    // Join the room when the component mounts
    const userData = {
      displayName: user.displayName || "Anonymous",
      photoURL: user.photoURL || null,
      isAnonymous: user.isAnonymous || false,
    }

    const cleanup = roomPresence.join(roomId, user.uid, userData)

    // Leave the room when the component unmounts
    return () => {
      cleanup()
      if (user) {
        roomPresence.leave(roomId, user.uid)
      }
    }
  }, [user, roomId])

  return { roomUsers, userCount }
}
