"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getStreamsByStatus } from "@/services/stream-service"

export function StreamList() {
  const { user } = useAuth()
  const [liveStreams, setLiveStreams] = useState<any[]>([])
  const [upcomingStreams, setUpcomingStreams] = useState<any[]>([])
  const [pastStreams, setPastStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true)
        const [live, upcoming, past] = await Promise.all([
          getStreamsByStatus("live"),
          getStreamsByStatus("scheduled"),
          getStreamsByStatus("ended"),
        ])

        setLiveStreams(live)
        setUpcomingStreams(upcoming)
        setPastStreams(past)
      } catch (error) {
        console.error("Error fetching streams:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStreams()
  }, [])

  const renderStreamCard = (stream: any) => {
    const djProfile = stream.dj_profiles
    const isStreamOwner = user && djProfile.user_id === user.uid

    return (
      <Card key={stream.id} className="overflow-hidden">
        <div className="aspect-video bg-gray-200 relative">
          <img
            src={stream.thumbnail_url || "/placeholder.svg?height=200&width=400&query=music+dj+stream"}
            alt={stream.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge
              variant={
                stream.status === "live" ? "destructive" : stream.status === "scheduled" ? "default" : "secondary"
              }
            >
              {stream.status === "live" ? "LIVE" : stream.status === "scheduled" ? "UPCOMING" : "ENDED"}
            </Badge>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-1">{stream.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-2">DJ: {djProfile.artist_name}</p>
          <p className="text-sm text-gray-500">
            {stream.status === "live"
              ? `Started ${new Date(stream.actual_start).toLocaleString()}`
              : stream.status === "scheduled"
                ? `Scheduled for ${new Date(stream.scheduled_start).toLocaleString()}`
                : `Ended ${new Date(stream.ended_at).toLocaleString()}`}
          </p>
        </CardContent>
        <CardFooter>
          {stream.status === "live" ? (
            <Button asChild className="w-full">
              <Link href={`/streams/${stream.id}`}>Watch Stream</Link>
            </Button>
          ) : stream.status === "scheduled" && isStreamOwner ? (
            <Button asChild className="w-full">
              <Link href={`/dashboard/streams/${stream.id}`}>Manage Stream</Link>
            </Button>
          ) : stream.status === "scheduled" ? (
            <Button asChild variant="outline" className="w-full">
              <Link href={`/streams/${stream.id}`}>View Details</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full">
              <Link href={`/streams/${stream.id}`}>View Recording</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="live">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="live">Live Now</TabsTrigger>
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="past">Past Streams</TabsTrigger>
      </TabsList>
      <TabsContent value="live" className="mt-6">
        {loading ? (
          <p>Loading streams...</p>
        ) : liveStreams.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No Live Streams</h3>
            <p className="text-gray-500 mt-2">There are no live streams at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveStreams.map(renderStreamCard)}
          </div>
        )}
      </TabsContent>
      <TabsContent value="upcoming" className="mt-6">
        {loading ? (
          <p>Loading streams...</p>
        ) : upcomingStreams.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No Upcoming Streams</h3>
            <p className="text-gray-500 mt-2">There are no scheduled streams.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingStreams.map(renderStreamCard)}
          </div>
        )}
      </TabsContent>
      <TabsContent value="past" className="mt-6">
        {loading ? (
          <p>Loading streams...</p>
        ) : pastStreams.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No Past Streams</h3>
            <p className="text-gray-500 mt-2">There are no past streams.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastStreams.map(renderStreamCard)}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
