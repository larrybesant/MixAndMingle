"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Lock, Users } from "lucide-react"

interface ChatRoom {
  id: string
  name: string
  description: string
  participants: number
  isPrivate: boolean
  createdAt: string
}

export function ChatRoomsList() {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const roomsRef = collection(db, "rooms")
    const roomsQuery = query(roomsRef, orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(roomsQuery, (snapshot) => {
      const roomData: ChatRoom[] = []
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<ChatRoom, "id">
        if (data.type === "chat") {
          roomData.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            participants: data.participants,
            isPrivate: data.isPrivate,
            createdAt: data.createdAt,
          })
        }
      })
      setRooms(roomData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <p>Loading chat rooms...</p>
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border p-8">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium">No Chat Rooms Available</h3>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          There are no chat rooms available at the moment. Create a new chat room to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rooms.map((room) => (
        <div key={room.id} className="rounded-lg border p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">{room.name}</h3>
                {room.isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{room.participants}</span>
                </Badge>
                <Link href={`/dashboard/chat-rooms/${room.id}`}>
                  <Button size="sm">Join</Button>
                </Link>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{room.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
