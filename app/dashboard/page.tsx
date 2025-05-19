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
import { seedNotifications, seedDatabase } from "@/app/actions/seed-actions"
import { toast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentMatches, setRecentMatches] = useState<any[]>([])
  const [recentMessages, setRecentMessages] = useState<any[]>([])
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to Mix-and-Mingle, {user?.displayName || "User"}!</p>
        </div>
        <form action={seedDatabase}>
          <Button type="submit" variant="outline">
            Seed Database
          </Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Matches</CardTitle>
            <CardDescription>Your current matches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMatches}</div>
            <p className="text-xs text-muted-foreground">+2 since last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Messages</CardTitle>
            <CardDescription>Your active conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeChats}</div>
            <p className="text-xs text-muted-foreground">+3 since last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Profile Views</CardTitle>
            <CardDescription>How many people viewed your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.profileViews}</div>
            <p className="text-xs text-muted-foreground">+10 since last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
            <CardDescription>Your most recent connections</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-40 bg-muted animate-pulse" />
                    <CardContent className="p-4">
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-3 bg-muted animate-pulse rounded mb-4" />
                      <div className="flex gap-1">
                        {Array(3)
                          .fill(0)
                          .map((_, j) => (
                            <div key={j} className="h-6 w-16 bg-muted animate-pulse rounded" />
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : recentMatches.length > 0 ? (
              recentMatches.map((match) => (
                <Card key={match.id} className="overflow-hidden">
                  <div className="relative h-40 bg-gradient-to-r from-primary/20 to-primary/10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage src={match.otherUser.photoURL || "/placeholder.svg"} />
                        <AvatarFallback>{match.otherUser.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{match.otherUser.displayName}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Matched {new Date(match.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {match.otherUser.interests?.slice(0, 3).map((interest: string) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full mt-4" size="sm" asChild>
                      <Link href={`/dashboard/messages/${match.id}`}>Message</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No matches yet. Start exploring to find connections!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Your most recent conversations</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 w-1/4 bg-muted animate-pulse rounded mb-2" />
                        <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    </CardContent>
                  </Card>
                ))
            ) : recentMessages.length > 0 ? (
              recentMessages.map((chat) => (
                <Link key={chat.id} href={`/dashboard/messages/${chat.matchId}`}>
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={chat.otherUser.photoURL || "/placeholder.svg"} />
                          <AvatarFallback>{chat.otherUser.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{chat.otherUser.displayName}</h3>
                          <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {chat.lastMessageTime
                            ? new Date(chat.lastMessageTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </div>
                        {chat.unreadCount > 0 && <Badge className="ml-auto">{chat.unreadCount}</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No messages yet. Start a conversation with your matches!</p>
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
