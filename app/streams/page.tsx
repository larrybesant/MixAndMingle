import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getLiveStreams } from "@/app/actions/live-streams"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Calendar, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function StreamsPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get all live and scheduled streams
  const streams = await getLiveStreams(true)

  // Separate live and upcoming streams
  const liveStreams = streams.filter((stream) => stream.status === "live")
  const upcomingStreams = streams.filter((stream) => stream.status === "scheduled")

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-cyan-500">
        Live DJ Streams
      </h1>
      <p className="text-center text-muted-foreground mb-10">
        Watch live DJ sets and interact with your favorite artists
      </p>

      <div className="space-y-10">
        {liveStreams.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              Live Now
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveStreams.map((stream) => (
                <Card key={stream.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-red-600 to-purple-600 text-white">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl truncate">{stream.title}</CardTitle>
                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4" />
                        <span className="text-sm">{stream.viewer_count}</span>
                      </div>
                    </div>
                    <CardDescription className="text-white/80 truncate">
                      {stream.event?.title ? `Event: ${stream.event.title}` : "Public Stream"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar>
                        <AvatarImage src={stream.dj?.profiles?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{stream.dj?.artist_name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{stream.dj?.artist_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {stream.dj?.profiles?.username || stream.dj?.profiles?.full_name}
                        </p>
                      </div>
                    </div>

                    {stream.actual_start && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Started {formatDistanceToNow(new Date(stream.actual_start), { addSuffix: true })}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-orange-500 to-cyan-500 hover:from-orange-600 hover:to-cyan-600"
                    >
                      <Link href={`/streams/${stream.id}`}>Watch Stream</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {upcomingStreams.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Upcoming Streams</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingStreams.map((stream) => (
                <Card key={stream.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                    <CardTitle className="text-xl truncate">{stream.title}</CardTitle>
                    <CardDescription className="text-white/80 truncate">
                      {stream.event?.title ? `Event: ${stream.event.title}` : "Public Stream"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar>
                        <AvatarImage src={stream.dj?.profiles?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{stream.dj?.artist_name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{stream.dj?.artist_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {stream.dj?.profiles?.username || stream.dj?.profiles?.full_name}
                        </p>
                      </div>
                    </div>

                    {stream.scheduled_start && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{new Date(stream.scheduled_start).toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/streams/${stream.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {liveStreams.length === 0 && upcomingStreams.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No streams available</h3>
            <p className="text-muted-foreground mb-6">Check back later for upcoming DJ streams</p>
          </div>
        )}
      </div>
    </div>
  )
}
