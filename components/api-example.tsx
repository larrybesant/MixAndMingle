"use client"

import { useState } from "react"
import { useApi } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface Room {
  id: string
  name: string
  category: string
  djName: string
  viewers: number
}

export function ApiExample() {
  const { data, isLoading, error, request } = useApi<Room[]>()
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const fetchRooms = async () => {
    await request<Room[]>("/api/rooms")
  }

  const createRoom = async () => {
    const newRoom = {
      name: "New Room",
      category: "Electronic",
      djName: "DJ Example",
    }

    await request<Room>("/api/rooms", {
      method: "POST",
      body: newRoom,
    })

    // Refresh the rooms list
    fetchRooms()
  }

  const viewRoomDetails = async (roomId: string) => {
    const room = await request<Room>(`/api/rooms/${roomId}`)
    if (room) {
      setSelectedRoom(room)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>API Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-4">
          <Button onClick={fetchRooms} disabled={isLoading}>
            {isLoading ? "Loading..." : "Fetch Rooms"}
          </Button>
          <Button onClick={createRoom} disabled={isLoading} variant="outline">
            Create Room
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-2">
            {data.map((room) => (
              <div
                key={room.id}
                className="p-4 border rounded-md flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => viewRoomDetails(room.id)}
              >
                <div>
                  <h3 className="font-medium">{room.name}</h3>
                  <p className="text-sm text-gray-500">DJ: {room.djName}</p>
                </div>
                <div className="text-sm">{room.viewers} viewers</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No rooms to display. Click "Fetch Rooms" to load data.</p>
        )}

        {selectedRoom && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>{selectedRoom.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Category:</strong> {selectedRoom.category}
              </p>
              <p>
                <strong>DJ:</strong> {selectedRoom.djName}
              </p>
              <p>
                <strong>Viewers:</strong> {selectedRoom.viewers}
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
