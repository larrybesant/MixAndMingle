"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Users, Music } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow, format } from "date-fns"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

interface LiveStreamsListProps {
  liveStreams: any[]
}

export function LiveStreamsList({ liveStreams }: LiveStreamsListProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const checkIfUserIsDj = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/signin")
      return
    }

    const { data } = await supabase.from("dj_profiles").select("id").eq("id", user.id).single()

    if (data) {
      router.push("/streams/new")
    } else {
      router.push("/dj-profile/create?redirect=/streams/new")
    }
  }

  if (!liveStreams || liveStreams.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No live streams found</h3>
        <p className="text-muted-foreground mt-1">Schedule a live stream to get started</p>
        <Button className="mt-4" onClick={checkIfUserIsDj}>
          Schedule Stream
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {liveStreams.map((stream) => (
        <Card key={stream.id} className="overflow-hidden">
          <div className="aspect-video bg-muted relative">
            {stream.thumbnail_url ? (
              <img
                src={stream.thumbnail_url || "/placeholder.svg"}
                alt={stream.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-500 to-indigo-700">
                <Music className="h-12 w-12 text-white opacity-75" />
              </div>
            )}
            <Badge className="absolute top-2 right-2" variant={stream.status === "live" ? "destructive" : "secondary"}>
              {stream.status === "live" ? "LIVE" : "Scheduled"}
            </Badge>
          </div>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl line-clamp-1">{stream.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={stream.dj?.profiles?.avatar_url || "/placeholder.svg"} alt={stream.dj?.artist_name} />
                <AvatarFallback>{stream.dj?.artist_name?.substring(0, 2).toUpperCase() || "DJ"}</AvatarFallback>
              </Avatar>
              <CardDescription>{stream.dj?.artist_name}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center text-sm">
              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {stream.status === "live"
                  ? "Started " + formatDistanceToNow(new Date(stream.actual_start), { addSuffix: true })
                  : format(new Date(stream.scheduled_start), "PPP 'at' h:mm a")}
              </span>
            </div>
            {stream.status === "live" && (
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{stream.viewer_count} viewers</span>
              </div>
            )}
            {stream.event && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  Event: {stream.event.title}
                </Badge>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-3">
            <Button variant={stream.status === "live" ? "default" : "outline"} className="w-full" asChild>
              <Link href={`/streams/${stream.id}`}>{stream.status === "live" ? "Join Stream" : "View Details"}</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
