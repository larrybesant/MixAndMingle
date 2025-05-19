"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getStreamsByStatus } from "@/services/stream-service"
import { hasDjProfile } from "@/services/dj-service"

export default function StreamsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [liveStreams, setLiveStreams] = useState<any[]>([])
  const [upcomingStreams, setUpcomingStreams] = useState<any[]>([])
  const [pastStreams, setPastStreams] = useState<any[]>([])
  const [isDj, setIsDj] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch streams by status
        const live = await getStreamsByStatus("live")
        const scheduled = await getStreamsByStatus("scheduled")
        const ended = await getStreamsByStatus("ended")

        setLiveStreams(live)
        setUpcomingStreams(scheduled)
        setPastStreams(ended)

        // Check if user is a DJ
        if (user) {
          const hasProfile = await hasDjProfile(user.uid)
          setIsDj(hasProfile)
        }
      } catch (error) {
        console.error("Error fetching streams:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const renderStreamCard = (stream: any) => {
    const djProfile = stream.dj_profiles
    const djUser = djProfile?.profiles

    return (
      <Card key={stream.id} className="bg-gray-900 border-gray-800 overflow-hidden">
        <div className="aspect-video bg-gray-800 relative">
          {stream.thumbnail_url ? (
            <img
              src={stream.thumbnail_url || "/placeholder.svg"}
              alt={stream.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-500">No thumbnail</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge
              variant="outline"
              className={
                stream.status === "live"
                  ? "bg-red-900 text-white border-red-700"
                  : stream.status === "scheduled"
                    ? "bg-blue-900 text-white border-blue-700"
                    : "bg-gray-800 text-gray-300 border-gray-700"
              }
            >
              {stream.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-xl">{stream.title}</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={djUser?.avatar_url || "/placeholder.svg"} alt={djProfile?.artist_name} />
              <AvatarFallback>{djProfile?.artist_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-gray-300">{djProfile?.artist_name}</span>
          </div>
          <p className="text-gray-400 text-sm">
            {stream.status === "live"
              ? `Started ${new Date(stream.actual_start).toLocaleString()}`
              : stream.status === "scheduled"
                ? `Scheduled for ${new Date(stream.scheduled_start).toLocaleString()}`
                : `Ended ${new Date(stream.ended_at).toLocaleString()}`}
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
            <Link href={`/streams/${stream.id}`}>{stream.status === "live" ? "Watch Now" : "View Details"}</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Live Streams</h1>
          <p className="text-gray-400">Watch and interact with DJs in real-time</p>
        </div>
        {isDj && (
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/dashboard/streams/create")}>
            Create Stream
          </Button>
        )}
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="live">Live Now</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Streams</TabsTrigger>
        </TabsList>
        <TabsContent value="live">
          {loading ? (
            <div className="flex items-center justify-center h-64">Loading...</div>
          ) : liveStreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {liveStreams.map(renderStreamCard)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-gray-400 mb-4">No live streams at the moment</p>
              {isDj && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push("/dashboard/streams/create")}
                >
                  Start Streaming
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="upcoming">
          {loading ? (
            <div className="flex items-center justify-center h-64">Loading...</div>
          ) : upcomingStreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {upcomingStreams.map(renderStreamCard)}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">No upcoming streams scheduled</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="past">
          {loading ? (
            <div className="flex items-center justify-center h-64">Loading...</div>
          ) : pastStreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {pastStreams.map(renderStreamCard)}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">No past streams available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
