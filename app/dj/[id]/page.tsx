"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Calendar, Music, Clock, Users, Star, Heart } from "lucide-react"
import { getDjProfileById } from "@/services/dj-service"
import { getStreamsByDjId } from "@/services/stream-service"
import { followDj, unfollowDj, isFollowingDj } from "@/services/social-service"
import { useToast } from "@/hooks/use-toast"

export default function DjProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [djProfile, setDjProfile] = useState<any>(null)
  const [streams, setStreams] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        // Fetch DJ profile
        const profile = await getDjProfileById(id as string)

        if (!profile) {
          setError("DJ profile not found")
          return
        }

        setDjProfile(profile)

        // Fetch streams for this DJ
        const djStreams = await getStreamsByDjId(id as string)
        setStreams(djStreams)

        // Check if user is following this DJ
        if (user) {
          const following = await isFollowingDj(user.uid, id as string)
          setIsFollowing(following)
        }

        // TODO: Fetch followers count
        // For now, use a random number
        setFollowersCount(Math.floor(Math.random() * 1000))
      } catch (err) {
        console.error("Error fetching DJ profile:", err)
        setError("Failed to load DJ profile. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user])

  const handleFollowToggle = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to follow DJs",
        variant: "destructive",
      })
      return
    }

    try {
      if (isFollowing) {
        await unfollowDj(user.uid, id as string)
        setIsFollowing(false)
        setFollowersCount((prev) => prev - 1)

        toast({
          title: "Unfollowed",
          description: `You are no longer following ${djProfile?.artist_name}`,
        })
      } else {
        await followDj(user.uid, id as string)
        setIsFollowing(true)
        setFollowersCount((prev) => prev + 1)

        toast({
          title: "Following",
          description: `You are now following ${djProfile?.artist_name}`,
        })
      }
    } catch (err) {
      console.error("Error toggling follow status:", err)
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!djProfile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>DJ profile not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  const userProfile = djProfile.profiles
  const liveStreams = streams.filter((stream) => stream.status === "live")
  const upcomingStreams = streams.filter((stream) => stream.status === "scheduled")
  const pastStreams = streams.filter((stream) => stream.status === "ended")

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={userProfile?.avatar_url || "/placeholder.svg"} alt={djProfile.artist_name} />
                  <AvatarFallback>{djProfile.artist_name.charAt(0)}</AvatarFallback>
                </Avatar>

                <h1 className="text-2xl font-bold mb-1">{djProfile.artist_name}</h1>

                <p className="text-muted-foreground mb-4">
                  {userProfile?.first_name} {userProfile?.last_name}
                </p>

                <div className="flex gap-4 mb-6">
                  <div className="flex flex-col items-center">
                    <span className="font-bold">{followersCount}</span>
                    <span className="text-xs text-muted-foreground">Followers</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-bold">{streams.length}</span>
                    <span className="text-xs text-muted-foreground">Streams</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-bold">{djProfile.experience_years}</span>
                    <span className="text-xs text-muted-foreground">Years</span>
                  </div>
                </div>

                <Button
                  className={isFollowing ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? (
                    <>
                      <Heart className="mr-2 h-4 w-4 fill-primary" />
                      Following
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div>
                  <h2 className="font-semibold mb-2">About</h2>
                  <p className="text-sm">{djProfile.bio || "No bio provided."}</p>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-muted-foreground">Experience</div>
                  <div>{djProfile.experience_years} years</div>

                  <div className="text-muted-foreground">Hourly Rate</div>
                  <div>${djProfile.hourly_rate}/hour</div>
                </div>

                <div>
                  <h2 className="font-semibold mb-2">Genres</h2>
                  <div className="flex flex-wrap gap-2">
                    {djProfile.genres?.length > 0 ? (
                      djProfile.genres.map((genre: any) => (
                        <Badge key={genre.id} variant="secondary">
                          {genre.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No genres specified</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="streams">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="streams">
                <Music className="mr-2 h-4 w-4" />
                Streams
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </TabsTrigger>
            </TabsList>

            <TabsContent value="streams" className="pt-6">
              <div className="space-y-6">
                {liveStreams.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="destructive">LIVE</Badge>
                      <h2 className="font-bold">Live Now</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {liveStreams.map((stream) => (
                        <Card key={stream.id}>
                          <div className="aspect-video bg-gray-200 relative">
                            <img
                              src={
                                stream.thumbnail_url || "/placeholder.svg?height=200&width=400&query=music+dj+stream"
                              }
                              alt={stream.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {stream.viewer_count || 0}
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold truncate">{stream.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Started {new Date(stream.actual_start).toLocaleString()}
                            </p>
                            <Button asChild className="w-full mt-4">
                              <Link href={`/streams/${stream.id}`}>Watch Now</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {pastStreams.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary">PAST</Badge>
                      <h2 className="font-bold">Past Streams</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pastStreams.slice(0, 4).map((stream) => (
                        <Card key={stream.id}>
                          <div className="aspect-video bg-gray-200 relative">
                            <img
                              src={
                                stream.thumbnail_url || "/placeholder.svg?height=200&width=400&query=music+dj+stream"
                              }
                              alt={stream.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {stream.max_viewers || 0} peak viewers
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold truncate">{stream.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Ended {new Date(stream.ended_at).toLocaleString()}
                            </p>
                            <Button asChild variant="outline" className="w-full mt-4">
                              <Link href={`/streams/${stream.id}`}>Watch Recording</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {pastStreams.length > 4 && (
                      <div className="flex justify-center mt-4">
                        <Button variant="outline">View All Past Streams</Button>
                      </div>
                    )}
                  </div>
                )}

                {liveStreams.length === 0 && pastStreams.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Music className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No streams yet</h3>
                    <p className="text-muted-foreground mb-6">
                      {djProfile.artist_name} hasn't streamed yet. Follow to get notified when they go live!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Streams</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingStreams.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingStreams.map((stream) => (
                        <div key={stream.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
                          <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                            <img
                              src={stream.thumbnail_url || "/placeholder.svg?height=100&width=100&query=music"}
                              alt={stream.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{stream.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {new Date(stream.scheduled_start).toLocaleString()}
                            </p>
                          </div>
                          <Button asChild size="sm">
                            <Link href={`/streams/${stream.id}`}>Details</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No upcoming streams</h3>
                      <p className="text-muted-foreground">
                        {djProfile.artist_name} hasn't scheduled any upcoming streams yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
