"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getMatches, getMatchedProfiles } from "@/services/match-service"
import { getChatRoomByMatchId, getChatMessages } from "@/services/chat-service"
import { getUserInterests } from "@/services/interest-service"
import { seedNotifications, seedHybridData } from "@/app/actions/seed-actions"
import { toast } from "@/components/ui/use-toast"
import { getStreamsByStatus } from "@/services/stream-service"
import { Music, Radio, MessageSquare, Users } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentMatches, setRecentMatches] = useState<any[]>([])
  const [recentMessages, setRecentMessages] = useState<any[]>([])
  const [liveStreams, setLiveStreams] = useState<any[]>([])
  const [upcomingStreams, setUpcomingStreams] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalMatches: 0,
    activeChats: 0,
    profileViews: 0,
    interestMatchRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Fetch matches from Supabase
        const matches = await getMatches(user.uid)
        const acceptedMatches = matches.filter((match) => match.status === "accepted")

        // Get matched profiles
        const matchedProfiles = await getMatchedProfiles(user.uid)

        // Get recent matches with details
        const recentMatchesWithDetails = await Promise.all(
          matchedProfiles.slice(0, 3).map(async (profile) => {
            // Find the match object
            const match = acceptedMatches.find((m) => m.user1_id === profile.id || m.user2_id === profile.id)

            if (!match) return null

            // Get interests
            const interests = await getUserInterests(profile.id)

            return {
              id: match.id,
              otherUser: {
                id: profile.id,
                displayName: `${profile.first_name} ${profile.last_name}`.trim(),
                photoURL: profile.avatar_url,
                interests,
              },
              createdAt: match.created_at,
            }
          }),
        )

        setRecentMatches(recentMatchesWithDetails.filter(Boolean))

        // Fetch recent messages
        const recentChats = await Promise.all(
          acceptedMatches.slice(0, 3).map(async (match) => {
            const chatRoom = await getChatRoomByMatchId(match.id)
            if (!chatRoom) return null

            const messages = await getChatMessages(chatRoom.id)
            const lastMessage = messages[messages.length - 1]

            // Get the other user's profile
            const otherUserId = match.user1_id === user.uid ? match.user2_id : match.user1_id
            const otherUserProfile = matchedProfiles.find((profile) => profile.id === otherUserId)

            if (!otherUserProfile) return null

            return {
              id: chatRoom.id,
              matchId: match.id,
              lastMessage: lastMessage?.content || "Start a conversation",
              lastMessageTime: lastMessage?.created_at,
              unreadCount: messages.filter((msg) => !msg.is_read && msg.sender_id !== user.uid).length,
              otherUser: {
                id: otherUserProfile.id,
                displayName: `${otherUserProfile.first_name} ${otherUserProfile.last_name}`.trim(),
                photoURL: otherUserProfile.avatar_url,
              },
            }
          }),
        )

        setRecentMessages(recentChats.filter(Boolean))

        // Fetch live streams
        const liveStreamsData = await getStreamsByStatus("live")
        setLiveStreams(liveStreamsData.slice(0, 3))

        // Fetch upcoming streams
        const upcomingStreamsData = await getStreamsByStatus("scheduled")
        setUpcomingStreams(upcomingStreamsData.slice(0, 3))

        // Calculate stats
        setStats({
          totalMatches: acceptedMatches.length,
          activeChats: recentChats.filter(Boolean).length,
          profileViews: Math.floor(Math.random() * 50) + 10, // Placeholder for now
          interestMatchRate: Math.floor(Math.random() * 30) + 70, // Placeholder percentage
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const handleSeedNotifications = async () => {
    if (!user) return

    try {
      const result = await seedNotifications(user.uid)
      if (result.success) {
        toast({
          title: "Notifications Seeded",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error seeding notifications:", error)
      toast({
        title: "Error",
        description: "Failed to seed notifications",
        variant: "destructive",
      })
    }
  }

  const handleSeedHybridData = async () => {
    try {
      const result = await seedHybridData()
      if (result.success) {
        toast({
          title: "Hybrid Data Seeded",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error seeding hybrid data:", error)
      toast({
        title: "Error",
        description: "Failed to seed hybrid data",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to Mix-and-Mingle, {user?.displayName || "User"}!</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-500 hover:bg-blue-950"
            onClick={handleSeedHybridData}
          >
            Seed Hybrid Data
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Matches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalMatches}</div>
            <p className="text-xs text-muted-foreground">+2 since last week</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Active Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.activeChats}</div>
            <p className="text-xs text-muted-foreground">+3 since last week</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Live Streams</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{liveStreams.length}</div>
            <p className="text-xs text-muted-foreground">Happening now</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Music Match</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.interestMatchRate}%</div>
            <p className="text-xs text-muted-foreground">Based on your music taste</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Matches</CardTitle>
            <CardDescription className="text-gray-400">Your most recent connections</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gray-800 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-800 animate-pulse rounded" />
                        <div className="h-3 w-32 bg-gray-800 animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : recentMatches.length > 0 ? (
              <div className="space-y-4">
                {recentMatches.map((match) => (
                  <div key={match.id} className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={match.otherUser.photoURL || "/placeholder.svg"} />
                      <AvatarFallback>{match.otherUser.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-white">{match.otherUser.displayName}</p>
                      <p className="text-sm text-gray-400">Matched {new Date(match.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                      <Link href={`/dashboard/messages/${match.id}`}>Message</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No matches yet. Start exploring to find connections!</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Live & Upcoming Streams</CardTitle>
            <CardDescription className="text-gray-400">Join live DJ sets or set reminders</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded bg-gray-800 animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-24 bg-gray-800 animate-pulse rounded" />
                        <div className="h-3 w-32 bg-gray-800 animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : liveStreams.length > 0 || upcomingStreams.length > 0 ? (
              <div className="space-y-4">
                {liveStreams.map((stream) => (
                  <div key={stream.id} className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded overflow-hidden">
                      <img
                        src={stream.thumbnail_url || "/placeholder.svg?height=48&width=48&query=dj"}
                        alt={stream.title}
                        className="object-cover h-full w-full"
                      />
                      <Badge className="absolute top-0 left-0 bg-red-600 text-xs">LIVE</Badge>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{stream.title}</p>
                      <p className="text-sm text-gray-400">by {stream.dj_profiles.artist_name}</p>
                    </div>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700" asChild>
                      <Link href={`/dashboard/streams/${stream.id}`}>Join</Link>
                    </Button>
                  </div>
                ))}
                {upcomingStreams.slice(0, 3 - liveStreams.length).map((stream) => (
                  <div key={stream.id} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded overflow-hidden">
                      <img
                        src={stream.thumbnail_url || "/placeholder.svg?height=48&width=48&query=dj"}
                        alt={stream.title}
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{stream.title}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(stream.scheduled_start).toLocaleDateString()} at{" "}
                        {new Date(stream.scheduled_start).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                      <Link href={`/dashboard/streams/${stream.id}`}>Remind</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No streams available. Check back later!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={handleSeedNotifications}>
            Seed Notifications (Dev Only)
          </Button>
        </div>
      )}
    </div>
  )
}
