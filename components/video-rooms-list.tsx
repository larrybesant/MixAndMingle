"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Users, Video } from "lucide-react"

interface VideoRoom {
  id: string
  name: string
  description: string
  participants: number
  isPrivate: boolean
  createdAt: string
  thumbnailUrl?: string
}

export function VideoRoomsList() {
  const [rooms, setRooms] = useState<VideoRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const roomsRef = collection(db, "rooms")
    const roomsQuery = query(roomsRef, where("type", "==", "video"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(roomsQuery, (snapshot) => {
      const roomData: VideoRoom[] = []
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<VideoRoom, "id">
        roomData.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          participants: data.participants,
          isPrivate: data.isPrivate,
          createdAt: data.createdAt,
          thumbnailUrl: data.thumbnailUrl,
        })
      })
      setRooms(roomData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <p>Loading video rooms...</p>
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border p-8">
        <Video className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium">No Video Rooms Available</h3>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          There are no video rooms available at the moment. Create a new video room to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <Card key={room.id}>
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            <img
              src={room.thumbnailUrl || "/placeholder.svg?height=200&width=400&query=video%20chat%20room"}
              alt={room.name}
              className="h-full w-full object-cover"
            />
            {room.isPrivate && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Private</span>
                </Badge>
              </div>
            )}
          </div>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-lg">{room.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-sm text-muted-foreground">{room.description}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex items-center justify-between">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{room.participants} online</span>
            </Badge>
            <Link href={`/dashboard/video-rooms/${room.id}`}>
              <Button size="sm">Join</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
