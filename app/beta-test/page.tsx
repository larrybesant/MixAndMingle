import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import BetaTestDashboard from "./beta-test-dashboard"

export default async function BetaTestPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin?callbackUrl=/beta-test")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get events
  const { data: events } = await supabase.from("events").select("*").order("start_date", { ascending: true })

  // Get DJ profiles
  const { data: djProfiles } = await supabase.from("dj_profiles").select(`
      *,
      profiles:id (
        first_name,
        last_name,
        avatar_url
      )
    `)

  // Get live streams
  const { data: liveStreams } = await supabase
    .from("live_streams")
    .select(`
      *,
      dj:dj_id (
        artist_name,
        profiles:id (
          first_name,
          last_name,
          avatar_url
        )
      )
    `)
    .in("status", ["scheduled", "live"])
    .order("scheduled_start", { ascending: true })

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-cyan-500">
        Beta Test Dashboard
      </h1>
      <p className="text-center text-muted-foreground mb-10">
        Welcome to the beta test! Use this dashboard to test all features of the application.
      </p>

      <BetaTestDashboard
        user={user}
        profile={profile || null}
        events={events || []}
        djProfiles={djProfiles || []}
        liveStreams={liveStreams || []}
      />
    </div>
  )
}
