"use client"

import { useAuth } from "@/context/auth-context"
import { useEffect, useState } from "react"

export default function DebugAuthPage() {
  const { user, profile, isLoading } = useAuth()
  const [clientSide, setClientSide] = useState(false)

  useEffect(() => {
    setClientSide(true)
  }, [])

  if (!clientSide) {
    return <div>Loading client-side component...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Auth Status</h2>
        <p>Loading: {isLoading ? "Yes" : "No"}</p>
        <p>Authenticated: {user ? "Yes" : "No"}</p>
      </div>

      {user && (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold mb-2">User Information</h2>
          <pre className="bg-white p-2 rounded overflow-auto">{JSON.stringify(user, null, 2)}</pre>
        </div>
      )}

      {profile && (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold mb-2">Profile Information</h2>
          <pre className="bg-white p-2 rounded overflow-auto">{JSON.stringify(profile, null, 2)}</pre>
        </div>
      )}

      {!user && !isLoading && (
        <div className="mt-4">
          <p>You are not logged in.</p>
          <a href="/signin" className="text-blue-500 hover:underline">
            Go to Sign In
          </a>
        </div>
      )}
    </div>
  )
}
