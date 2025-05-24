"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Video, Users, TrendingUp, Clock, Star, Gift } from "lucide-react"

export default function DashboardHome() {
  const stats = [
    { name: "Active Chats", value: "12", icon: MessageCircle, change: "+2.5%" },
    { name: "Video Calls Today", value: "8", icon: Video, change: "+12%" },
    { name: "New Connections", value: "24", icon: Users, change: "+8.1%" },
    { name: "Gifts Received", value: "156", icon: Gift, change: "+23%" },
  ]

  const activeRooms = [
    { name: "General Chat", members: 45, type: "public" },
    { name: "Music Lovers", members: 23, type: "public" },
    { name: "Gaming Squad", members: 12, type: "private" },
    { name: "Book Club", members: 8, type: "premium" },
  ]

  const recentActivity = [
    { user: "Sarah M.", action: "joined Music Lovers room", time: "2 min ago" },
    { user: "Mike R.", action: "sent you a virtual gift", time: "5 min ago" },
    { user: "Emma L.", action: "started a video call", time: "12 min ago" },
    { user: "Alex K.", action: "liked your profile", time: "1 hour ago" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, John! 👋</h2>
        <p className="text-purple-100">You have 3 new messages and 2 friend requests waiting for you.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.change} from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Rooms */}
        <Card>
          <CardHeader>
            <CardTitle>Active Chat Rooms</CardTitle>
            <CardDescription>Join popular conversations happening now</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeRooms.map((room) => (
              <div key={room.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{room.name}</p>
                    <p className="text-sm text-muted-foreground">{room.members} members online</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {room.type === "premium" && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  <Button size="sm">Join</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Stay updated with your network</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${activity.user[0]}`} />
                  <AvatarFallback>{activity.user[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with these popular features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col space-y-2">
              <MessageCircle className="h-6 w-6" />
              <span>Start New Chat</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Video className="h-6 w-6" />
              <span>Create Video Room</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Find Friends</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
