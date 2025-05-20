"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data - in a real app, this would come from Firebase Analytics
const generateRealtimeData = () => {
  const now = new Date()
  const data = []

  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000)
    const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    data.push({
      time: timeStr,
      users: Math.floor(Math.random() * 50) + 100,
      messages: Math.floor(Math.random() * 200) + 300,
      rooms: Math.floor(Math.random() * 10) + 20,
    })
  }

  return data
}

const mockRecentEvents = [
  { id: 1, type: "login", user: "user123", time: "2 seconds ago" },
  { id: 2, type: "message_send", user: "user456", time: "5 seconds ago" },
  { id: 3, type: "video_room_join", user: "user789", time: "10 seconds ago" },
  { id: 4, type: "subscription_start", user: "user234", time: "15 seconds ago" },
  { id: 5, type: "gift_send", user: "user567", time: "20 seconds ago" },
  { id: 6, type: "badge_earn", user: "user890", time: "25 seconds ago" },
  { id: 7, type: "login", user: "user321", time: "30 seconds ago" },
  { id: 8, type: "message_send", user: "user654", time: "35 seconds ago" },
  { id: 9, type: "video_room_join", user: "user987", time: "40 seconds ago" },
  { id: 10, type: "login", user: "user432", time: "45 seconds ago" },
]

export function RealTimeAnalytics() {
  const [realtimeData, setRealtimeData] = useState(generateRealtimeData())
  const [activeUsers, setActiveUsers] = useState(125)
  const [activeRooms, setActiveRooms] = useState(28)
  const [messagesPerMinute, setMessagesPerMinute] = useState(342)
  const [recentEvents, setRecentEvents] = useState(mockRecentEvents)

  useEffect(() => {
    // Update data every 5 seconds
    const interval = setInterval(() => {
      setRealtimeData(generateRealtimeData())
      setActiveUsers(Math.floor(Math.random() * 50) + 100)
      setActiveRooms(Math.floor(Math.random() * 10) + 20)
      setMessagesPerMinute(Math.floor(Math.random() * 200) + 300)

      // Update recent events
      const newEvent = {
        id: Date.now(),
        type: ["login", "message_send", "video_room_join", "subscription_start", "gift_send"][
          Math.floor(Math.random() * 5)
        ],
        user: `user${Math.floor(Math.random() * 1000)}`,
        time: "just now",
      }

      setRecentEvents((prev) => [newEvent, ...prev.slice(0, 9)])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "login":
        return "bg-blue-500"
      case "message_send":
        return "bg-green-500"
      case "video_room_join":
        return "bg-purple-500"
      case "subscription_start":
        return "bg-yellow-500"
      case "gift_send":
        return "bg-pink-500"
      case "badge_earn":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Users online right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeUsers}</div>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Live
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Rooms</CardTitle>
            <CardDescription>Chat and video rooms in use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeRooms}</div>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Live
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Messages Per Minute</CardTitle>
            <CardDescription>Message activity rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{messagesPerMinute}</div>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Live
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Real-time Activity</CardTitle>
            <CardDescription>User activity in the last 30 minutes</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer
              config={{
                users: {
                  label: "Active Users",
                  color: "hsl(var(--chart-1))",
                },
                messages: {
                  label: "Messages",
                  color: "hsl(var(--chart-2))",
                },
                rooms: {
                  label: "Active Rooms",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={realtimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="messages"
                    stroke="var(--color-messages)"
                    strokeWidth={2}
                  />
                  <Line yAxisId="right" type="monotone" dataKey="rooms" stroke="var(--color-rooms)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest user activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-auto">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-3 border-b pb-2">
                  <Badge className={getEventBadgeColor(event.type)}>{event.type.replace("_", " ")}</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.user}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Locations</CardTitle>
            <CardDescription>Where users are connecting from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">World Map Visualization</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
