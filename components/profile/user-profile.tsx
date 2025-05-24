"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  Edit,
  Save,
  Crown,
  Gift,
  MessageCircle,
  Video,
  Users,
  Star,
  Calendar,
  MapPin,
  LinkIcon,
} from "lucide-react"

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    email: "john@example.com",
    bio: "Love connecting with people and sharing great conversations! Always up for a good chat or video call.",
    location: "San Francisco, CA",
    website: "https://johndoe.com",
    joinDate: "January 2024",
  })

  const stats = [
    { label: "Messages Sent", value: "2,847", icon: MessageCircle },
    { label: "Video Calls", value: "156", icon: Video },
    { label: "Connections", value: "342", icon: Users },
    { label: "Gifts Received", value: "89", icon: Gift },
  ]

  const achievements = [
    { name: "Early Adopter", description: "Joined in the first month", icon: Star },
    { name: "Social Butterfly", description: "Made 100+ connections", icon: Users },
    { name: "Chat Master", description: "Sent 1000+ messages", icon: MessageCircle },
    { name: "Video Pro", description: "Completed 50+ video calls", icon: Video },
  ]

  const handleSave = () => {
    // In a real app, save to backend
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" />
                  <AvatarFallback className="text-2xl">JD</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button size="sm" className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0">
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <span>
                    {profile.firstName} {profile.lastName}
                  </span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </CardTitle>
                <CardDescription>@{profile.username}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">{profile.bio}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <LinkIcon className="h-4 w-4 text-gray-500" />
                  <a href={profile.website} className="text-purple-600 hover:underline">
                    {profile.website}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Joined {profile.joinDate}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <stat.icon className="h-4 w-4 text-gray-500 mr-1" />
                    </div>
                    <div className="font-bold text-lg">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Your accomplishments on Mix & Mingle</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.name} className="flex items-center space-x-3 p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <achievement.icon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{achievement.name}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Joined Music Lovers chat room", time: "2 hours ago", type: "chat" },
                      { action: "Completed video call with Team Standup", time: "1 day ago", type: "video" },
                      { action: "Received virtual gift from Sarah M.", time: "2 days ago", type: "gift" },
                      { action: "Connected with 3 new people", time: "3 days ago", type: "connection" },
                      { action: "Updated profile picture", time: "1 week ago", type: "profile" },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          {activity.type === "chat" && <MessageCircle className="h-4 w-4 text-purple-600" />}
                          {activity.type === "video" && <Video className="h-4 w-4 text-purple-600" />}
                          {activity.type === "gift" && <Gift className="h-4 w-4 text-purple-600" />}
                          {activity.type === "connection" && <Users className="h-4 w-4 text-purple-600" />}
                          {activity.type === "profile" && <Edit className="h-4 w-4 text-purple-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
