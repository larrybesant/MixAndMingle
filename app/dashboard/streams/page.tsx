"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle } from "lucide-react"
import { getDjProfileByUserId } from "@/services/dj-service"
import { getStreamsByDjId } from "@/services/stream-service"

export default function DashboardStreamsPage() {
  const { user } = useAuth()
  const [djProfile, setDjProfile] = useState<any>(null)
  const [streams, setStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Fetch DJ profile
        const profile = await getDjProfileByUserId(user.uid)
        setDjProfile(profile)

        if (profile) {
          // Fetch streams for this DJ
          const djStreams = await getStreamsByDjId(profile.id)
          setStreams(djStreams)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!djProfile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create DJ Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need to create a DJ profile before you can manage streams.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/dj-profile">Create DJ Profile</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Streams</h1>
        <Button asChild>
          <Link href="/dashboard/streams/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Stream
          </Link>
        </Button>
      </div>

      {streams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium mb-2">No Streams Yet</h3>
            <p className="text-gray-500 mb-6">You haven't created any streams yet.</p>
            <Button asChild>
              <Link href="/dashboard/streams/create">Create Your First Stream</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
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
                <p className="text-sm text-gray-500">
                  {stream.status === "live"
                    ? `Started ${new Date(stream.actual_start).toLocaleString()}`
                    : stream.status === "scheduled"
                      ? `Scheduled for ${new Date(stream.scheduled_start).toLocaleString()}`
                      : `Ended ${new Date(stream.ended_at).toLocaleString()}`}
                </p>
                {stream.status === "live" && (
                  <p className="text-sm font-medium mt-2">
                    {stream.viewer_count} {stream.viewer_count === 1 ? "viewer" : "viewers"}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                {stream.status === "live" ? (
                  <Button asChild className="w-full">
                    <Link href={`/streams/${stream.id}`}>Go to Stream</Link>
                  </Button>
                ) : stream.status === "scheduled" ? (
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/streams/${stream.id}`}>Manage Stream</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/streams/${stream.id}`}>View Recording</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
