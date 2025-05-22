"use client"

import { useState, useEffect } from "react"
import { roomStats } from "@/lib/firebase/realtime-database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, Music, Star } from "lucide-react"

interface RoomStatsDisplayProps {
  roomId: string
}

export default function RoomStatsDisplay({ roomId }: RoomStatsDisplayProps) {
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) return

    setLoading(true)
    const unsubscribe = roomStats.getStats(roomId, (statsData) => {
      setStats(statsData || {})
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [roomId])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="h-4 w-1/2 rounded bg-gray-200"></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-1/2 rounded bg-gray-200"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statItems = [
    {
      title: "Listeners",
      value: stats.listenerCount || 0,
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Duration",
      value: stats.durationMinutes ? `${stats.durationMinutes} min` : "0 min",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      title: "Tracks",
      value: stats.trackCount || 0,
      icon: <Music className="h-4 w-4" />,
    },
    {
      title: "Rating",
      value: stats.rating ? `${stats.rating.toFixed(1)}/5.0` : "N/A",
      icon: <Star className="h-4 w-4" />,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              {item.icon}
              <span className="ml-1">{item.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
