"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function ClientTestPage() {
  const [status, setStatus] = useState("Checking authentication...")
  const [error, setError] = useState<string | null>(null)

  // Use the client-side Supabase client
  const checkAuth = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setError(error.message)
        setStatus("Error")
        return
      }

      if (data.session) {
        setStatus(`Authenticated as ${data.session.user.email}`)
      } else {
        setStatus("Not authenticated")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setStatus("Error")
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Client Test Page</h1>
      <p>This is a client component that uses the client-side Supabase client.</p>

      <div className="mt-6">
        <button onClick={checkAuth} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Check Authentication
        </button>

        <div className="mt-4">
          <p>Status: {status}</p>
          {error && <p className="text-red-500">Error: {error}</p>}
        </div>
      </div>
    </div>
  )
}
