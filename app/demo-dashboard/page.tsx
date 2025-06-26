"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  MessageCircle,
  Heart,
  MapPin,
  Play,
  Headphones,
  Radio,
  TrendingUp,
  Bell,
  Settings,
  Search,
  Home,
  Music,
} from "lucide-react"

export default function DemoDashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // Mock user data
  const mockUser = {
    username: "john_doe",
    full_name: "John Doe",
    bio: "Music lover and aspiring DJ. Love connecting with people through beats and good vibes!",
    location: "Los Angeles, CA",
    music_preferences: ["House", "Techno", "Hip-Hop"],
    is_dj: true,
    avatar_url: "",
    profile_completed: true,
  }

  const profileCompletion = 85

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Mix & Mingle
              </div>
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg" alt={mockUser.full_name} />
                <AvatarFallback className="bg-purple-600 text-white">JD</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-bold text-white">Welcome, {mockUser.full_name?.split(" ")[0]}!</h1>
                <p className="text-sm text-gray-400">@{mockUser.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-purple-400 text-purple-400 hover:bg-purple-400/10">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-purple-400 text-purple-400 hover:bg-purple-400/10">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-purple-500/30 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: Home },
              { id: "rooms", label: "Live Rooms", icon: Radio },
              { id: "matches", label: "Matches", icon: Heart },
              { id: "messages", label: "Messages", icon: MessageCircle },
              { id: "discover", label: "Discover", icon: Search },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-purple-400 text-purple-400"
                      : "border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile & Stats */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Profile Completion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-purple-400 font-semibold">{profileCompletion}%</span>
                    </div>
                    <Progress value={profileCompletion} className="h-3" />
                    <p className="text-sm text-gray-400">
                      {profileCompletion < 100
                        ? "Complete your profile to get better matches!"
                        : "Your profile is complete!"}
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Complete Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Info */}
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarImage src="/placeholder.svg" alt={mockUser.full_name} />
                      <AvatarFallback className="bg-purple-600 text-white text-xl">JD</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-white">{mockUser.full_name}</h3>
                    <p className="text-gray-400">@{mockUser.username}</p>
                    {mockUser.is_dj && (
                      <Badge className="mt-2 bg-purple-600 text-white">
                        <Headphones className="w-3 h-3 mr-1" />
                        DJ
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{mockUser.location}</span>
                    </div>
                    <p className="text-sm text-gray-300">{mockUser.bio}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white mb-2">Music Preferences</p>
                    <div className="flex flex-wrap gap-1">
                      {mockUser.music_preferences?.map((genre, index) => (
                        <Badge key={index} variant="outline" className="border-purple-400 text-purple-400 text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - Main Content */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => setActiveTab("rooms")}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-16 flex-col"
                    >
                      <Radio className="w-6 h-6 mb-1" />
                      <span className="text-sm">Join Room</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab("matches")}
                      className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 h-16 flex-col"
                    >
                      <Heart className="w-6 h-6 mb-1" />
                      <span className="text-sm">Find Matches</span>
                    </Button>
                    <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-16 flex-col">
                      <Play className="w-6 h-6 mb-1" />
                      <span className="text-sm">Go Live</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab("messages")}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-16 flex-col"
                    >
                      <MessageCircle className="w-6 h-6 mb-1" />
                      <span className="text-sm">Messages</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Live Rooms */}
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Radio className="w-5 h-5 mr-2" />
                    Live Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "House Vibes Only", dj: "DJ Sarah", listeners: 234, genre: "House" },
                      { name: "Late Night Techno", dj: "DJ Mike", listeners: 156, genre: "Techno" },
                      { name: "Hip-Hop Classics", dj: "DJ Alex", listeners: 89, genre: "Hip-Hop" },
                    ].map((room, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-white">{room.name}</h4>
                          <p className="text-sm text-gray-400">by {room.dj}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="border-purple-400 text-purple-400 text-xs">
                              {room.genre}
                            </Badge>
                            <span className="text-xs text-gray-400">{room.listeners} listening</span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          Join
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Activity & Friends */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { text: "New match with Emma!", time: "2h ago" },
                      { text: 'Joined "Chill Vibes" room', time: "4h ago" },
                      { text: "Message from Alex", time: "6h ago" },
                      { text: "Someone liked your profile", time: "1d ago" },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-white">{activity.text}</p>
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Friends Online */}
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Friends Online
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Emma Wilson", status: 'In "House Party" room' },
                      { name: "Alex Chen", status: "Listening to Techno" },
                      { name: "Sarah Johnson", status: "DJing live" },
                    ].map((friend, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="/placeholder.svg" alt={friend.name} />
                            <AvatarFallback className="bg-purple-600 text-white text-xs">
                              {friend.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{friend.name}</p>
                          <p className="text-xs text-gray-400">{friend.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Demo Notice */}
              <Card className="bg-green-900/20 border-green-500/30">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                      <Play className="w-4 h-4 text-green-400" />
                    </div>
                    <h3 className="text-green-400 font-semibold">Demo Mode</h3>
                    <p className="text-sm text-gray-300">Full Mix & Mingle experience</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "rooms" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Live DJ Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "House Vibes Only", dj: "DJ Sarah", listeners: 234, genre: "House", image: "/dj-room-1.jpg" },
                { name: "Late Night Techno", dj: "DJ Mike", listeners: 156, genre: "Techno", image: "/dj-room-2.jpg" },
                { name: "Hip-Hop Classics", dj: "DJ Alex", listeners: 89, genre: "Hip-Hop", image: "/dj-room-3.jpg" },
                { name: "Chill Lounge", dj: "DJ Emma", listeners: 67, genre: "Ambient", image: "/dj-room-1.jpg" },
                { name: "Latin Beats", dj: "DJ Carlos", listeners: 123, genre: "Latin", image: "/dj-room-2.jpg" },
                {
                  name: "Electronic Dreams",
                  dj: "DJ Luna",
                  listeners: 198,
                  genre: "Electronic",
                  image: "/dj-room-3.jpg",
                },
              ].map((room, index) => (
                <Card key={index} className="bg-black/40 border-purple-500/30 overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <Music className="w-12 h-12 text-white" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-white mb-1">{room.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">by {room.dj}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-purple-400 text-purple-400 text-xs">
                          {room.genre}
                        </Badge>
                        <span className="text-xs text-gray-400">{room.listeners} listening</span>
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Join
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "matches" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Find Your Match</h2>
            <div className="max-w-md mx-auto">
              <Card className="bg-black/40 border-purple-500/30">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <Avatar className="w-32 h-32 mx-auto">
                      <AvatarImage src="/placeholder.svg" alt="Emma" />
                      <AvatarFallback className="bg-pink-600 text-white text-2xl">EM</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Emma, 24</h3>
                      <p className="text-gray-400">Music Producer • Los Angeles</p>
                    </div>
                    <p className="text-gray-300">
                      "Love creating beats and discovering new artists. Always down for a good house music session!"
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {["House", "Techno", "Deep House"].map((genre) => (
                        <Badge key={genre} variant="outline" className="border-purple-400 text-purple-400">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex space-x-4 pt-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1 border-red-400 text-red-400 hover:bg-red-400/10"
                      >
                        Pass
                      </Button>
                      <Button
                        size="lg"
                        className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                      >
                        <Heart className="w-5 h-5 mr-2" />
                        Like
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Messages</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Emma Wilson", message: "Hey! Love your music taste 🎵", time: "2m ago", unread: true },
                      { name: "Alex Chen", message: "That DJ set was amazing!", time: "1h ago", unread: false },
                      { name: "Sarah Johnson", message: "Want to collab on a track?", time: "3h ago", unread: false },
                    ].map((chat, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="/placeholder.svg" alt={chat.name} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {chat.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-white truncate">{chat.name}</p>
                            <span className="text-xs text-gray-400">{chat.time}</span>
                          </div>
                          <p className="text-sm text-gray-400 truncate">{chat.message}</p>
                        </div>
                        {chat.unread && <div className="w-2 h-2 bg-purple-400 rounded-full"></div>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="lg:col-span-2">
                <Card className="bg-black/40 border-purple-500/30 h-96">
                  <CardContent className="p-6 h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                      <p>Select a conversation to start chatting</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === "discover" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Discover</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Trending DJs", count: "12 new", icon: Headphones },
                { title: "Popular Rooms", count: "8 live", icon: Radio },
                { title: "New Matches", count: "3 waiting", icon: Heart },
                { title: "Events", count: "5 this week", icon: Music },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <Card key={index} className="bg-black/40 border-purple-500/30">
                    <CardContent className="p-6 text-center">
                      <Icon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                      <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-400">{item.count}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
