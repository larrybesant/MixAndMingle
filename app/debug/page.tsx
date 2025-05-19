import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DebugPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Check if user is authenticated
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  // Get database schema information
  const { data: tables, error: tablesError } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public")

  // Check if user profile exists
  let profileData = null
  let profileError = null

  if (session) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    profileData = data
    profileError = error
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-6">
      <h1 className="text-3xl font-bold">Debug Dashboard</h1>

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">✓ Authenticated</p>
              <p>User ID: {session.user.id}</p>
              <p>Email: {session.user.email}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-red-600 font-medium">✗ Not authenticated</p>
              {sessionError && (
                <div className="bg-red-50 p-3 rounded-md">
                  <p className="text-red-700">Error: {sessionError.message}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Status */}
      {session && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Status</CardTitle>
          </CardHeader>
          <CardContent>
            {profileData ? (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">✓ Profile found</p>
                <pre className="bg-gray-100 p-3 rounded-md overflow-auto text-sm">
                  {JSON.stringify(profileData, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-red-600 font-medium">✗ Profile not found</p>
                {profileError && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <p className="text-red-700">Error: {profileError.message}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Database Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
        </CardHeader>
        <CardContent>
          {tables ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">✓ Found {tables.length} tables</p>
              <ul className="list-disc pl-5 space-y-1">
                {tables.map((table, index) => (
                  <li key={index}>{table.table_name}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-red-600 font-medium">✗ Could not fetch tables</p>
              {tablesError && (
                <div className="bg-red-50 p-3 rounded-md">
                  <p className="text-red-700">Error: {tablesError.message}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supabase Client Check */}
      <Card>
        <CardHeader>
          <CardTitle>Supabase Client</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600 font-medium">✓ Supabase client initialized</p>
          <p className="text-sm text-muted-foreground mt-2">
            If you're seeing this, the Supabase client was successfully initialized.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
