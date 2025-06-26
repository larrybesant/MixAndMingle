"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestConnectionPage() {
  const [status, setStatus] = useState<{
    supabase: "checking" | "connected" | "error"
    auth: "checking" | "ready" | "error"
    database: "checking" | "ready" | "needs-setup" | "error"
  }>({
    supabase: "checking",
    auth: "checking",
    database: "checking",
  })

  const [error, setError] = useState("")

  useEffect(() => {
    testConnections()
  }, [])

  const testConnections = async () => {
    try {
      // Test Supabase connection
      const { supabase } = await import("@/lib/supabase/client")

      // Test auth
      const { data: session } = await supabase.auth.getSession()
      setStatus((prev) => ({ ...prev, supabase: "connected", auth: "ready" }))

      // Test database - check if profiles table exists
      const { error: dbError } = await supabase.from("profiles").select("count(*)").limit(1)

      if (dbError) {
        if (dbError.message.includes("relation") || dbError.message.includes("does not exist")) {
          setStatus((prev) => ({ ...prev, database: "needs-setup" }))
        } else {
          setStatus((prev) => ({ ...prev, database: "error" }))
          setError(dbError.message)
        }
      } else {
        setStatus((prev) => ({ ...prev, database: "ready" }))
      }
    } catch (err: any) {
      setStatus((prev) => ({ ...prev, supabase: "error", auth: "error", database: "error" }))
      setError(err.message)
    }
  }

  const createProfilesTable = async () => {
    try {
      const { supabase } = await import("@/lib/supabase/client")

      // This will fail if user doesn't have admin access, but that's expected
      const { error } = await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS profiles (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            username TEXT UNIQUE,
            bio TEXT,
            music_preferences TEXT[],
            relationship_style TEXT,
            gender TEXT,
            profile_completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
          CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
        `,
      })

      if (error) {
        setError("Cannot create table automatically. Please run the SQL manually in Supabase dashboard.")
      } else {
        setStatus((prev) => ({ ...prev, database: "ready" }))
        setError("")
      }
    } catch (err: any) {
      setError("Cannot create table automatically. Please run the SQL manually in Supabase dashboard.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "ready":
        return "text-green-500"
      case "checking":
        return "text-yellow-500"
      case "needs-setup":
        return "text-orange-500"
      case "error":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
      case "ready":
        return "✅ Ready"
      case "checking":
        return "🔄 Checking..."
      case "needs-setup":
        return "⚠️ Needs Setup"
      case "error":
        return "❌ Error"
      default:
        return "❓ Unknown"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Connection Test</h1>

        <div className="grid gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Supabase Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-lg ${getStatusColor(status.supabase)}`}>{getStatusText(status.supabase)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-lg ${getStatusColor(status.auth)}`}>{getStatusText(status.auth)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Database (Profiles Table)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-lg ${getStatusColor(status.database)}`}>{getStatusText(status.database)}</div>
              {status.database === "needs-setup" && (
                <div className="mt-4">
                  <Button onClick={createProfilesTable} className="bg-blue-600 mr-4">
                    Try Auto-Setup
                  </Button>
                  <p className="text-sm text-gray-400 mt-2">
                    If auto-setup fails, run the SQL manually in Supabase dashboard
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="bg-red-900 border-red-700 mb-4">
            <CardContent className="pt-6">
              <p className="text-red-200">{error}</p>
            </CardContent>
          </Card>
        )}

        {status.database === "needs-setup" && (
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Manual Setup SQL</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-green-400 text-sm overflow-x-auto bg-black p-4 rounded">
                {`CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  bio TEXT,
  music_preferences TEXT[],
  relationship_style TEXT,
  gender TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile" ON profiles 
FOR ALL USING (auth.uid() = id);`}
              </pre>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 mt-8">
          <Button onClick={testConnections} className="bg-blue-600">
            Test Again
          </Button>
          <Button onClick={() => (window.location.href = "/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
