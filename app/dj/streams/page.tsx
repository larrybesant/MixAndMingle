import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getDjProfile } from "@/app/actions/dj-profiles"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Clock, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default async function DjStreamsPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/signin?callbackUrl=/dj/streams")
  }

  // Check if user has a DJ profile
  const profile = await getDjProfile(user.id)
  if (!profile) {
    redirect("/dj-profile")
  }

  // Get user's streams
  const { data: streams } = await supabase
    .from("live_streams")
    .select(`
      *,
      event:event_id (
        title
      )
    `)
    .eq("dj_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-cyan-500">
          My Streams
        </h1>

        <Button
          asChild
          className="bg-gradient-to-r from-orange-500 to-cyan-500 hover:from-orange-600 hover:to-cyan-600"
        >
          <Link href="/dj/streams/create">Create New Stream</Link>
        </Button>
      </div>

      {streams && streams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <Card key={stream.id} className="overflow-hidden">
              <CardHeader
                className={`
                ${
                  stream.status === "live"
                    ? "bg-red-600"
                    : stream.status === "scheduled"
                      ? "bg-blue-600"
                      : stream.status === "ended"
                        ? "bg-gray-600"
                        : "bg-orange-600"
                } 
                text-white
              `}
              >
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl truncate">{stream.title}</CardTitle>
                  <span className="px-2 py-1 rounded-full bg-black/20 text-xs font-medium uppercase">
                    {stream.status}
                  </span>
                </div>
                <CardDescription className="text-white/80 truncate">
                  {stream.event?.title ? `Event: ${stream.event.title}` : "No associated event"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {stream.scheduled_start && (
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>{new Date(stream.scheduled_start).toLocaleString()}</span>
                    </div>
                  )}

                  {stream.actual_start && (
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Started {formatDistanceToNow(new Date(stream.actual_start), { addSuffix: true })}</span>
                    </div>
                  )}

                  <div className="flex items-center text-sm">
                    <Users className="mr-2 h-4 w-4" />
                    <span>{stream.viewer_count} viewers</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button asChild variant="outline">
                  <Link href={`/dj/streams/${stream.id}`}>
                    {stream.status === "scheduled"
                      ? "Manage"
                      : stream.status === "live"
                        ? "Go to Stream"
                        : "View Details"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No streams yet</h3>
          <p className="text-muted-foreground mb-6">Create your first stream to get started</p>
          <Button
            asChild
            className="bg-gradient-to-r from-orange-500 to-cyan-500 hover:from-orange-600 hover:to-cyan-600"
          >
            <Link href="/dj/streams/create">Create New Stream</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
