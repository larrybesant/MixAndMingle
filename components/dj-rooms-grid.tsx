"use client"

import { useState, useEffect } from "react"
import { DJRoomCard } from "@/components/dj-room-card"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"

interface DJRoom {
  id: string
  title: string
  dj: string
  viewers: number
  isLive?: boolean
  imageUrl?: string
}

interface DJRoomsGridProps {
  initialRooms?: DJRoom[]
  title?: string
}

export function DJRoomsGrid({ initialRooms = [], title = "Live DJ Rooms" }: DJRoomsGridProps) {
  const [rooms, setRooms] = useState<DJRoom[]>(initialRooms)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = async () => {
    // Only fetch if we need to refresh - we already have initialRooms
    if (initialRooms.length > 0 && !isLoading) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/rooms")

      if (!response.ok) {
        throw new Error("Failed to fetch rooms")
      }

      const data = await response.json()
      setRooms(data)
    } catch (err) {
      console.error("Error fetching rooms:", err)
      setError("Unable to load rooms. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Only fetch if we don't have initial rooms
  useEffect(() => {
    if (initialRooms.length === 0) {
      fetchRooms()
    }
  }, [initialRooms.length])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>

        <Button variant="outline" size="sm" onClick={fetchRooms} disabled={isLoading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && <div className="rounded-md bg-red-50 p-4 text-red-800">{error}</div>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="rounded-md border border-border">
              <div className="aspect-video w-full bg-muted animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : rooms.length > 0 ? (
          // Actual rooms
          rooms.map((room) => (
            <DJRoomCard
              key={room.id}
              id={room.id}
              title={room.title}
              dj={room.dj}
              viewers={room.viewers}
              isLive={room.isLive}
              imageUrl={room.imageUrl}
            />
          ))
        ) : (
          // No rooms found
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No DJ rooms are currently available.</p>
            <Button variant="outline" className="mt-4" onClick={fetchRooms}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
