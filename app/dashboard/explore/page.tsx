"use client"

import { useEffect, useState } from "react"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Check, X } from "lucide-react"
import { getPotentialMatches, createMatchWithNotification } from "@/services/match-service"
import { getUserInterests } from "@/services/interest-service"
import { getNearbyUsers } from "@/services/location-service"
import { getProfileById } from "@/services/profile-service"

export default function ExplorePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("discover")

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Get potential matches from Supabase
        const potentialMatches = await getPotentialMatches(user.uid, 20)

        // Transform the data to match our component's expectations
        const recommendations = await Promise.all(
          potentialMatches.map(async ({ profile, matchScore }) => {
            // Get the user's interests
            const interests = await getUserInterests(profile.id)

            return {
              id: profile.id,
              displayName: `${profile.first_name} ${profile.last_name}`.trim(),
              photoURL: profile.avatar_url,
              bio: profile.bio,
              location: profile.location,
              interests,
              matchScore,
              sharedInterests: [], // Will be calculated below
            }
          }),
        )

        // Get current user's interests to calculate shared interests
        const userInterests = await getUserInterests(user.uid)

        // Calculate shared interests
        const recommendationsWithSharedInterests = recommendations.map((recommendation) => {
          const sharedInterests = recommendation.interests.filter((interest: string) =>
            userInterests.includes(interest),
          )

          return {
            ...recommendation,
            sharedInterests,
          }
        })

        setRecommendations(recommendationsWithSharedInterests)
      } catch (error) {
        console.error("Error fetching recommendations:", error)
        toast({
          title: "Error",
          description: "Failed to load recommendations",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchNearbyUsers = async () => {
      if (!user) return

      try {
        // Get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })

        const { latitude, longitude } = position.coords

        // Get nearby users
        const nearbyUserIds = await getNearbyUsers(user.uid, latitude, longitude, 50)

        // Get profiles for nearby users
        const nearbyUserProfiles = await Promise.all(
          nearbyUserIds.map(async (userId) => {
            const profile = await getProfileById(userId)
            const interests = await getUserInterests(userId)

            if (!profile) return null

            return {
              id: profile.id,
              displayName: `${profile.first_name} ${profile.last_name}`.trim(),
              photoURL: profile.avatar_url,
              bio: profile.bio,
              location: profile.location,
              interests,
            }
          }),
        )

        // Filter out null values
        setNearbyUsers(nearbyUserProfiles.filter(Boolean))
      } catch (error) {
        console.error("Error fetching nearby users:", error)
        // Don't show an error toast here as location might not be available
        setNearbyUsers([])
      }
    }

    if (activeTab === "discover") {
      fetchRecommendations()
    } else if (activeTab === "nearby") {
      fetchNearbyUsers()
    }
  }, [user, toast, activeTab])

  const handleConnect = async () => {
    if (!user || currentIndex >= recommendations.length) return

    try {
      const matchedUser = recommendations[currentIndex]

      // Create a match in Supabase with notifications
      const match = await createMatchWithNotification(user.uid, matchedUser.id, matchedUser.matchScore)

      if (!match) {
        throw new Error("Failed to create match")
      }

      // Also create a match in Firestore for backward compatibility
      const matchId = `${user.uid}_${matchedUser.id}`
      await setDoc(doc(db, "matches", matchId), {
        users: [user.uid, matchedUser.id],
        createdAt: new Date(),
        status: "pending", // The other user needs to accept
      })

      toast({
        title: "Connection Request Sent",
        description: `You've sent a connection request to ${matchedUser.displayName}`,
      })

      // Move to next recommendation
      setCurrentIndex((prev) => prev + 1)
    } catch (error) {
      console.error("Error connecting:", error)
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      })
    }
  }

  const handleSkip = () => {
    setCurrentIndex((prev) => prev + 1)
  }

  const currentRecommendation = recommendations[currentIndex]
  const displayedUsers = activeTab === "discover" ? recommendations : nearbyUsers

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Explore</h2>
        <p className="text-muted-foreground">Discover people with similar interests</p>
      </div>

      <Tabs defaultValue="discover" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
        </TabsList>
        <TabsContent value="discover" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-64 w-full max-w-md bg-muted animate-pulse rounded-xl" />
            </div>
          ) : recommendations.length > 0 && currentIndex < recommendations.length ? (
            <div className="flex flex-col items-center justify-center">
              <Card className="w-full max-w-md overflow-hidden">
                <div className="relative h-64 bg-gradient-to-r from-primary/20 to-primary/10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Avatar className="h-32 w-32 border-4 border-background">
                      <AvatarImage src={currentRecommendation.photoURL || "/placeholder.svg"} />
                      <AvatarFallback>{currentRecommendation.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-2xl font-bold">{currentRecommendation.displayName}</h3>
                      <p className="text-muted-foreground">{currentRecommendation.bio}</p>
                      {currentRecommendation.location && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="inline-flex items-center">📍 {currentRecommendation.location}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Shared Interests:</p>
                      <div className="flex flex-wrap gap-2">
                        {currentRecommendation.sharedInterests.map((interest: string) => (
                          <Badge key={interest} variant="default">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Other Interests:</p>
                      <div className="flex flex-wrap gap-2">
                        {currentRecommendation.interests
                          .filter((interest: string) => !currentRecommendation.sharedInterests.includes(interest))
                          .map((interest: string) => (
                            <Badge key={interest} variant="outline">
                              {interest}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Match Score: {Math.round(currentRecommendation.matchScore * 100)}%</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-6 pt-0">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={handleSkip}>
                    <X className="h-6 w-6" />
                    <span className="sr-only">Skip</span>
                  </Button>
                  <Button size="icon" className="h-12 w-12 rounded-full" onClick={handleConnect}>
                    <Check className="h-6 w-6" />
                    <span className="sr-only">Connect</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No more recommendations available at the moment.</p>
              <p className="text-muted-foreground">Check back later for new connections!</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="nearby" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array(6)
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
                ))}
            </div>
          ) : nearbyUsers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {nearbyUsers.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <div className="relative h-40 bg-gradient-to-r from-muted/50 to-muted/30">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage src={user.photoURL || "/placeholder.svg"} />
                        <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{user.displayName}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{user.bio}</p>
                    {user.location && (
                      <p className="text-xs text-muted-foreground mb-2">
                        <span className="inline-flex items-center">📍 {user.location}</span>
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.interests?.slice(0, 3).map((interest: string) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      className="w-full mt-4"
                      size="sm"
                      onClick={async () => {
                        try {
                          // Create a match
                          await createMatchWithNotification(user.uid, user.id, 0.5) // Default match score

                          toast({
                            title: "Connection Request Sent",
                            description: `You've sent a connection request to ${user.displayName}`,
                          })

                          // Remove from the list
                          setNearbyUsers((prev) => prev.filter((u) => u.id !== user.id))
                        } catch (error) {
                          console.error("Error connecting:", error)
                          toast({
                            title: "Error",
                            description: "Failed to send connection request",
                            variant: "destructive",
                          })
                        }
                      }}
                    >
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No nearby users found.</p>
              <p className="text-muted-foreground">Try expanding your search radius in settings.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
