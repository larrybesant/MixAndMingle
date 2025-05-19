"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, RefreshCw, Info } from "lucide-react"
import { StreamBroadcaster } from "@/components/stream-broadcaster"
import { StreamViewer } from "@/components/stream-viewer"
import { StreamChatContainer } from "@/components/stream-chat-container"
import { ErrorBoundary } from "@/components/error-boundary"
import { getStreamById } from "@/services/stream-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StreamPage() {
  const { streamId } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stream, setStream] = useState<any>(null)
  const [isDj, setIsDj] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const fetchStreamData = async () => {
    if (!streamId) return

    try {
      setLoading(true)
      setError(null)

      // Fetch stream data
      const streamData = await getStreamById(streamId as string)

      if (!streamData) {
        setError("Stream not found")
        return
      }

      setStream(streamData)

      // Check if current user is the DJ
      if (user && streamData?.dj_profiles?.user_id) {
        const isDjCheck = user.uid === streamData.dj_profiles.user_id
        setIsDj(isDjCheck)
      }
    } catch (err) {
      console.error("Error fetching stream:", err)
      setError("Failed to load stream data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStreamData()
  }, [streamId, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={fetchStreamData} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Stream not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  const djProfile = stream.dj_profiles
  const djUser = djProfile?.profiles

  // Mobile layout
  if (isMobile) {
    return (
      <div className="container mx-auto py-4 px-4">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{stream.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Badge
                variant={
                  stream.status === "live" ? "destructive" : stream.status === "scheduled" ? "default" : "secondary"
                }
              >
                {stream.status.toUpperCase()}
              </Badge>
              <span className="text-gray-500 text-sm">
                {stream.status === "live"
                  ? `Started ${new Date(stream.actual_start).toLocaleString()}`
                  : stream.status === "scheduled"
                    ? `Scheduled for ${new Date(stream.scheduled_start).toLocaleString()}`
                    : `Ended ${new Date(stream.ended_at).toLocaleString()}`}
              </span>
            </div>
          </div>

          <Tabs defaultValue="stream" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stream">Stream</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="stream" className="space-y-4 pt-4">
              <ErrorBoundary>
                {isDj ? (
                  <StreamBroadcaster streamId={stream.id} djId={djProfile.id} />
                ) : (
                  <StreamViewer streamId={stream.id} djId={djProfile.id} />
                )}
              </ErrorBoundary>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    About this Stream
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm">{stream.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">DJ Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={djUser?.avatar_url || "/placeholder.svg"} alt={djProfile?.artist_name} />
                      <AvatarFallback>{djProfile?.artist_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold">{djProfile?.artist_name}</h3>
                      <p className="text-gray-500 text-sm">
                        {djUser?.first_name} {djUser?.last_name}
                      </p>
                    </div>
                  </div>
                  <p className="mb-4 text-sm">{djProfile?.bio}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Experience:</div>
                    <div>{djProfile?.experience_years} years</div>
                    <div className="text-gray-500">Hourly Rate:</div>
                    <div>${djProfile?.hourly_rate}/hour</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="pt-4">
              <div className="h-[70vh]">
                <ErrorBoundary>
                  <StreamChatContainer streamId={stream.id} isDj={isDj} />
                </ErrorBoundary>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  // Desktop layout
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

            <ErrorBoundary>
              {isDj ? (
                <StreamBroadcaster streamId={stream.id} djId={djProfile.id} />
              ) : (
                <StreamViewer streamId={stream.id} djId={djProfile.id} />
              )}
            </ErrorBoundary>

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
            <ErrorBoundary>
              <StreamChatContainer streamId={stream.id} isDj={isDj} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  )
}
