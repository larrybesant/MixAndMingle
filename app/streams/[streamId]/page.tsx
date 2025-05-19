"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { StreamBroadcaster } from "@/components/stream-broadcaster"
import { StreamViewer } from "@/components/stream-viewer"
import { StreamChatContainer } from "@/components/stream-chat-container"
import { getStreamById } from "@/services/stream-service"

export default function StreamPage() {
  const { streamId } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stream, setStream] = useState<any>(null)
  const [isDj, setIsDj] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!streamId) return

      try {
        setLoading(true)

        // Fetch stream data
        const streamData = await getStreamById(streamId as string)
        setStream(streamData)

        // Check if current user is the DJ
        if (user && streamData?.dj_profiles?.user_id) {
          const isDjCheck = user.uid === streamData.dj_profiles.user_id
          setIsDj(isDjCheck)
        }
      } catch (error) {
        console.error("Error fetching stream:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [streamId, user])

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!stream) {
    return <div className="flex items-center justify-center h-full">Stream not found</div>
  }

  const djProfile = stream.dj_profiles
  const djUser = djProfile?.profiles

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{stream.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant={
                    stream.status === "live" ? "destructive" : stream.status === "scheduled" ? "default" : "secondary"
                  }
                >
                  {stream.status.toUpperCase()}
                </Badge>
                <span className="text-gray-500">
                  {stream.status === "live"
                    ? `Started ${new Date(stream.actual_start).toLocaleString()}`
                    : stream.status === "scheduled"
                      ? `Scheduled for ${new Date(stream.scheduled_start).toLocaleString()}`
                      : `Ended ${new Date(stream.ended_at).toLocaleString()}`}
                </span>
              </div>
            </div>

            {isDj ? (
              <StreamBroadcaster streamId={stream.id} djId={djProfile.id} />
            ) : (
              <StreamViewer streamId={stream.id} djId={djProfile.id} />
            )}

            <Card>
              <CardHeader>
                <CardTitle>About this Stream</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{stream.description}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>DJ Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={djUser?.avatar_url || "/placeholder.svg"} alt={djProfile?.artist_name} />
                  <AvatarFallback>{djProfile?.artist_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{djProfile?.artist_name}</h3>
                  <p className="text-gray-500">
                    {djUser?.first_name} {djUser?.last_name}
                  </p>
                </div>
              </div>
              <p className="mb-4">{djProfile?.bio}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Experience:</div>
                <div>{djProfile?.experience_years} years</div>
                <div className="text-gray-500">Hourly Rate:</div>
                <div>${djProfile?.hourly_rate}/hour</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex-1 min-h-[500px]">
            <StreamChatContainer streamId={stream.id} isDj={isDj} />
          </div>
        </div>
      </div>
    </div>
  )
}
