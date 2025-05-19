import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserNav } from "./user-nav"

export async function DashboardHeader() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {profile?.first_name || "there"}!</h1>
        <p className="text-muted-foreground mt-1">Manage your events, DJ profile, and live streams</p>
      </div>
      <div className="flex items-center gap-4">
        <Button asChild>
          <Link href="/events/new">Create Event</Link>
        </Button>
        <UserNav user={user} profile={profile} />
      </div>
    </div>
  )
}
