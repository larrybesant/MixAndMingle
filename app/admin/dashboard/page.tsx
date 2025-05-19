import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Radio, Activity, Mail, Bell, Settings } from "lucide-react"

export default async function AdminDashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin?redirect=/admin/dashboard")
  }

  // Check if the user is an admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  // Get stats
  const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })
  const { count: eventCount } = await supabase.from("events").select("*", { count: "exact", head: true })
  const { count: djCount } = await supabase.from("dj_profiles").select("*", { count: "exact", head: true })
  const { count: streamCount } = await supabase.from("live_streams").select("*", { count: "exact", head: true })

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="p-4 bg-green-100 border border-green-300 rounded-md mb-6">
        <p className="text-green-800">Success! You can access the Admin Dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{userCount || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{eventCount || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">DJ Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Radio className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{djCount || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{streamCount || 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Admin Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Email System</CardTitle>
            <CardDescription>Manage and test email notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/email-system">
                <Mail className="mr-2 h-4 w-4" />
                Email System
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification System</CardTitle>
            <CardDescription>Manage in-app notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/setup-notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notification System
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage users and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/users">
                <Settings className="mr-2 h-4 w-4" />
                User Management
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
