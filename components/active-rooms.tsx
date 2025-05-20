"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, MessageSquare } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Room {
  id: string
  name: string
  type: "chat" | "video"
  participants: number
  isPrivate: boolean
}

export function ActiveRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const roomsRef = collection(db, "rooms")
    const roomsQuery = query(roomsRef, where("active", "==", true))

    const unsubscribe = onSnapshot(roomsQuery, (snapshot) => {
      const roomData: Room[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        roomData.push({
          id: doc.id,
          name: data.name,
          type: data.type,
          participants: data.participants,
          isPrivate: data.isPrivate,
        })
      })
      setRooms(roomData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Rooms</CardTitle>
      </CardHeader>
      <CardContent>
        {rooms.length === 0 ? (
          <p className="text-center text-muted-foreground">No active rooms</p>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/dashboard/${room.type}-rooms/${room.id}`}
                className="block rounded-lg border p-4 hover:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {room.type === "video" ? <Video className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                    <span className="font-medium">{room.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {room.isPrivate && <Badge variant="outline">Private</Badge>}
                    <Badge>{room.participants} online</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
