"use client"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SimpleDashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/signin?callbackUrl=/simple-dashboard")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {profile?.first_name || session.user.email}!</h1>
          <p className="text-muted-foreground mt-1">This is a simplified dashboard for debugging purposes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-muted-foreground">{session.user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-muted-foreground">{session.user.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Sign In</p>
                <p className="text-muted-foreground">{new Date(session.user.last_sign_in_at || "").toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => {}}>
              Edit Profile
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-muted-foreground">
                    {profile.first_name} {profile.last_name}
                  </p>
                </div>
                {profile.created_at && (
                  <div>
                    <p className="text-sm font-medium">Profile Created</p>
                    <p className="text-muted-foreground">{new Date(profile.created_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-md">
                <p className="font-medium">Profile Not Found</p>
                <p className="text-sm mt-1">Your profile information could not be found. Please contact support.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => {}}>
              Update Profile
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>Technical details for troubleshooting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Session Data</h3>
                <pre className="bg-gray-100 p-3 rounded-md overflow-auto text-sm mt-2">
                  {JSON.stringify(
                    {
                      user: {
                        id: session.user.id,
                        email: session.user.email,
                        role: session.user.role,
                        last_sign_in_at: session.user.last_sign_in_at,
                      },
                      expires_at: session.expires_at,
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium">Profile Data</h3>
                <pre className="bg-gray-100 p-3 rounded-md overflow-auto text-sm mt-2">
                  {JSON.stringify(profile, null, 2) || "No profile data found"}
                </pre>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <a href="/debug">Go to Debug Page</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
