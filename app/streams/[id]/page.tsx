import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { getStreamDetails } from "@/app/actions/live-streams"
import StreamViewer from "@/components/streams/stream-viewer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface StreamPageProps {
  params: {
    id: string
  }
}

export default async function StreamPage({ params }: StreamPageProps) {
  const { id } = params
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/signin?callbackUrl=/streams/" + id)
  }

  // Get stream details
  const stream = await getStreamDetails(id)

  if (!stream) {
    notFound()
  }

  // Check if stream is accessible
  if (stream.status !== "live" && stream.status !== "scheduled") {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Stream Unavailable</h1>
        <p className="mb-8">This stream has ended or been cancelled.</p>
        <Button asChild>
          <Link href="/streams">Browse Other Streams</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/streams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Streams
          </Link>
        </Button>

        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-cyan-500">
          {stream.status === "live" ? "Live Stream" : "Upcoming Stream"}
        </h1>
      </div>

      {stream.status === "live" ? (
        <StreamViewer stream={stream} userId={user.id} />
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium mb-2">{stream.title}</h2>
          <p className="text-muted-foreground mb-4">
            This stream is scheduled to start at {new Date(stream.scheduled_start).toLocaleString()}
          </p>
          <p className="mb-6">DJ: {stream.dj.artist_name}</p>
          {stream.description && (
            <div className="max-w-2xl mx-auto mb-6">
              <h3 className="font-medium mb-2">About this stream</h3>
              <p className="text-muted-foreground">{stream.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
