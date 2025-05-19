"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ClientTestPage() {
  const [status, setStatus] = useState("Loading...")
  const [error, setError] = useState(null)
  const [session, setSession] = useState(null)

  useEffect(() => {
    async function checkClient() {
      try {
        const supabase = createClientComponentClient()

        // Check session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          setError(sessionError.message)
          setStatus("Error")
          return
        }

        if (session) {
          setSession(session)
          setStatus("Authenticated")
        } else {
          setStatus("Not authenticated")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        setStatus("Error")
      }
    }

    checkClient()
  }, [])

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Client-Side Supabase Test</h1>

      <Card>
        <CardHeader>
          <CardTitle>Client Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">Status: {status}</p>

          {error && (
            <div className="bg-red-50 p-3 rounded-md mt-4">
              <p className="text-red-700">Error: {error}</p>
            </div>
          )}

          {session && (
            <div className="mt-4">
              <p className="font-medium">Session Information:</p>
              <pre className="bg-gray-100 p-3 rounded-md overflow-auto text-sm mt-2">
                {JSON.stringify(
                  {
                    user: {
                      id: session.user.id,
                      email: session.user.email,
                    },
                    expires_at: session.expires_at,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          )}

          <div className="mt-6">
            <Button asChild>
              <a href="/debug">Go to Server Debug Page</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
