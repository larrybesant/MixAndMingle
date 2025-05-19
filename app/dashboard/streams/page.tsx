"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getStreamsByStatus } from "@/services/stream-service"
import { hasDjProfile } from "@/services/dj-service"
import { Play, Clock, Users } from "lucide-react"
import Link from "next/link"

export default function StreamsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [isDj, setIsDj] = useState(false)
  const [liveStreams, setLiveStreams] = useState<any[]>([])
  const [upcomingStreams, setUpcomingStreams] = useState<any[]>([])
  const [pastStreams, setPastStreams] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Check if user is a DJ
        const hasProfile = await hasDjProfile(user.uid)
        setIsDj(hasProfile)

        // Fetch streams
        const live = await getStreamsByStatus("live")
        setLiveStreams(live)

        const upcoming = await getStreamsByStatus("scheduled")
        setUpcomingStreams(upcoming)

        const past = await getStreamsByStatus("ended")
        setPastStreams(past)
      } catch (error) {
        console.error("Error fetching streams:", error)
        toast({
          title: "Error",
          description: "Failed to load streams",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, toast])

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Live Streams</h2>
          <p className="text-gray-400">Join live DJ sets or schedule your own</p>
        </div>

        {isDj && (
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/dashboard/streams/create")}>
            Create New Stream
          </Button>
        )}
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="live" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Live Now
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Past Streams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden bg-gray-900 border-gray-800">
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
          ) : liveStreams.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {liveStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} status="live" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No live streams at the moment.</p>
              <p className="text-gray-400">Check back later or browse upcoming streams.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden bg-gray-900 border-gray-800">
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
          ) : upcomingStreams.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} status="upcoming" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No upcoming streams scheduled.</p>
              {isDj && (
                <Button
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push("/dashboard/streams/create")}
                >
                  Schedule a Stream
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden bg-gray-900 border-gray-800">
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
          ) : pastStreams.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} status="past" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No past streams available.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StreamCard({ stream, status }: { stream: any; status: "live" | "upcoming" | "past" }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="overflow-hidden bg-gray-900 border-gray-800">
      <div className="relative h-40 overflow-hidden">
        <img
          src={stream.thumbnail_url || "/placeholder.svg?height=160&width=320&query=dj%20music%20stream"}
          alt={stream.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
        {status === "live" && <Badge className="absolute top-2 left-2 bg-red-600 animate-pulse">LIVE</Badge>}
      </div>
      <CardContent className="p-4">
        <h3 className="text-xl font-bold text-white mb-1">{stream.title}</h3>
        <p className="text-gray-400 mb-3">
          by{" "}
          {stream.dj_profiles.artist_name ||
            `${stream.dj_profiles.profiles.first_name} ${stream.dj_profiles.profiles.last_name}`}
        </p>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {status === "live"
                ? "Started " + formatDate(stream.actual_start)
                : status === "upcoming"
                  ? formatDate(stream.scheduled_start)
                  : "Ended " + formatDate(stream.ended_at)}
            </span>
          </div>
          {status === "live" && (
            <div className="flex items-center text-gray-400">
              <Users className="h-4 w-4 mr-1" />
              <span className="text-sm">{stream.viewer_count} watching</span>
            </div>
          )}
        </div>
        <Button
          className={`w-full ${
            status === "live"
              ? "bg-red-600 hover:bg-red-700"
              : status === "upcoming"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-700 hover:bg-gray-600"
          }`}
          asChild
        >
          <Link href={`/dashboard/streams/${stream.id}`}>
            <Play className="h-4 w-4 mr-2" />
            {status === "live" ? "Join Stream" : status === "upcoming" ? "Set Reminder" : "View Recording"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
