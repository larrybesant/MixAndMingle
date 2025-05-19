import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NotificationPreferencesForm } from "./notification-preferences-form"

export default async function NotificationPreferencesPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin?redirect=/notifications/preferences")
  }

  // Get the user's profile with notification preferences
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("email_notifications, push_notifications")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("Error fetching profile:", error)
    return (
      <div className="container max-w-4xl py-10">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>An error occurred while loading your preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Failed to load notification preferences. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive notifications from Social Event Planning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NotificationPreferencesForm
            initialEmailNotifications={profile.email_notifications}
            initialPushNotifications={profile.push_notifications}
          />
        </CardContent>
      </Card>
    </div>
  )
}
