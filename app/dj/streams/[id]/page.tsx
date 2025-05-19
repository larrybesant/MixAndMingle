import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { getDjProfile } from "@/app/actions/dj-profiles"
import StreamControlPanel from "@/components/dj/stream-control-panel"
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
    redirect("/signin?callbackUrl=/dj/streams/" + id)
  }

  // Check if user has a DJ profile
  const profile = await getDjProfile(user.id)
  if (!profile) {
    redirect("/dj-profile")
  }

  // Get stream details
  const { data: stream } = await supabase.from("live_streams").select("*").eq("id", id).eq("dj_id", user.id).single()

  if (!stream) {
    notFound()
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dj/streams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Streams
          </Link>
        </Button>

        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-cyan-500">
          Stream Control
        </h1>
      </div>

      <StreamControlPanel stream={stream} />
    </div>
  )
}
