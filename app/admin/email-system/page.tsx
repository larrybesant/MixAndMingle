import { redirect } from "next/navigation"
import { getCurrentUser, getUserProfile, checkIsAdmin } from "@/lib/supabase/server-actions"
import { EmailSystemClient } from "./email-system-client"

export default async function EmailSystemPage() {
  // Server-side authentication and authorization
  const user = await getCurrentUser()

  if (!user) {
    redirect("/signin?redirect=/admin/email-system")
  }

  const isAdmin = await checkIsAdmin(user.id)

  if (!isAdmin) {
    redirect("/dashboard")
  }

  // Fetch initial data on the server
  const profile = await getUserProfile(user.id)

  // Pass data to client component
  return <EmailSystemClient user={user} profile={profile} />
}
