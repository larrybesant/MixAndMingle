"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  MessageCircle,
  Heart,
  MapPin,
  Edit,
  Play,
  Headphones,
  Radio,
  TrendingUp,
  Bell,
  LogOut,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data for demo (replace with real user data in production)
  const mockUser = {
    id: "demo-user-123",
    email: "john@example.com",
    username: "john_doe",
    full_name: "John Doe",
    bio: "Music lover and aspiring DJ. Love connecting with people through beats and good vibes!",
    location: "Los Angeles, CA",
    music_preferences: ["House", "Techno", "Hip-Hop"],
    is_dj: true,
    avatar_url: "",
    profile_completed: true,
  };

  useEffect(() => {
    // Simulate loading then show dashboard
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSignOut = () => {
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black">
        <div className="text-xl text-white">Loading your dashboard...</div>
      </div>
    );
  }

  const profileCompletion = 85;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={mockUser.avatar_url || "/placeholder.svg"} alt={mockUser.full_name || 'User avatar'} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {mockUser.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 role="heading" aria-level={1} className="text-2xl font-bold text-white">
                  Welcome back, {mockUser.full_name?.split(" ")[0]}!
                </h1>
                <p className="text-gray-400">@{mockUser.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-400 text-purple-400 hover:bg-purple-400/10 focus-visible:ring-2 focus-visible:ring-purple-400"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/profile-setup")}
                className="border-purple-400 text-purple-400 hover:bg-purple-400/10 focus-visible:ring-2 focus-visible:ring-purple-400"
                aria-label="Edit Profile"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-red-400 text-red-400 hover:bg-red-400/10 focus-visible:ring-2 focus-visible:ring-red-400"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
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
                  {profileCompletion < 100 && (
                    <Button
                      size="sm"
                      onClick={() => {
                        window.location.href = "/profile-setup";
                      }}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Complete Profile
                    </Button>
                  )}
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
                    <AvatarImage src={mockUser.avatar_url || "/placeholder.svg"} alt={mockUser.full_name} />
                    <AvatarFallback className="bg-purple-600 text-white text-xl">
                      {mockUser.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
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
                  {mockUser.bio && <p className="text-sm text-gray-300">{mockUser.bio}</p>}
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
                    onClick={() => router.push("/rooms")}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-16 flex-col focus-visible:ring-2 focus-visible:ring-purple-400"
                    aria-label="Join Room"
                  >
                    <Radio className="w-6 h-6 mb-1" />
                    <span className="text-sm">Join Room</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/matchmaking")}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 h-16 flex-col focus-visible:ring-2 focus-visible:ring-pink-400"
                    aria-label="Find Matches"
                  >
                    <Heart className="w-6 h-6 mb-1" />
                    <span className="text-sm">Find Matches</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/go-live")}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-16 flex-col focus-visible:ring-2 focus-visible:ring-green-400"
                    aria-label="Go Live"
                  >
                    <Play className="w-6 h-6 mb-1" />
                    <span className="text-sm">Go Live</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/messages")}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-16 flex-col focus-visible:ring-2 focus-visible:ring-cyan-400"
                    aria-label="Messages"
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
                    {
                      name: "House Vibes Only",
                      dj: "DJ Sarah",
                      listeners: 234,
                      genre: "House",
                    },
                    {
                      name: "Late Night Techno",
                      dj: "DJ Mike",
                      listeners: 156,
                      genre: "Techno",
                    },
                    {
                      name: "Hip-Hop Classics",
                      dj: "DJ Alex",
                      listeners: 89,
                      genre: "Hip-Hop",
                    },
                  ].map((room, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                    >
                      <div>
                        <h2 className="font-semibold text-white text-lg">{room.name}</h2>
                        <p className="text-sm text-gray-400">by {room.dj}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="border-purple-400 text-purple-400 text-xs">{room.genre}</Badge>
                          <span className="text-xs text-gray-400">{room.listeners} listening</span>
                        </div>
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 focus-visible:ring-2 focus-visible:ring-purple-400" aria-label={`Join ${room.name}`}>
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
                    {
                      type: "match",
                      text: "New match with Emma!",
                      time: "2h ago",
                    },
                    {
                      type: "room",
                      text: 'Joined "Chill Vibes" room',
                      time: "4h ago",
                    },
                    {
                      type: "message",
                      text: "Message from Alex",
                      time: "6h ago",
                    },
                    {
                      type: "like",
                      text: "Someone liked your profile",
                      time: "1d ago",
                    },
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
                    { name: "Emma Wilson", status: 'In "House Party" room', avatar: "" },
                    { name: "Alex Chen", status: "Listening to Techno", avatar: "" },
                    { name: "Sarah Johnson", status: "DJing live", avatar: "" },
                  ].map((friend, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name || 'Friend avatar'} />
                          <AvatarFallback className="bg-purple-600 text-white text-xs">
                            {friend.name.split(" ").map((n) => n[0]).join("")}
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
          </div>
        </div>
      </div>
    </div>
  );
}
