import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getDjProfile } from "@/app/actions/dj-profiles"
import CreateStreamForm from "@/components/dj/create-stream-form"

export default async function CreateStreamPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/signin?callbackUrl=/dj/streams/create")
  }

  // Check if user has a DJ profile
  const profile = await getDjProfile(user.id)
  if (!profile) {
    redirect("/dj-profile")
  }

  // Get user's events
  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .eq("creator_id", user.id)
    .gte("end_time", new Date().toISOString())
    .order("start_time", { ascending: true })

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-cyan-500">
        Create Live Stream
      </h1>

      <CreateStreamForm events={events || []} />
    </div>
  )
}
