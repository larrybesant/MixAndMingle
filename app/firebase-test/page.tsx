"use client"

import { useState, useEffect } from "react"
import { initializeApp } from "firebase/app"
import { getAuth, signInAnonymously } from "firebase/auth"

export default function FirebaseTestPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function testFirebase() {
      try {
        // Log environment variables (safely)
        console.log("Firebase config check:", {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Set" : "Missing",
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Set" : "Missing",
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Set" : "Missing",
        })

        // Initialize Firebase
        const app = initializeApp({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        })

        // Test authentication
        const auth = getAuth(app)
        const result = await signInAnonymously(auth)

        setUser({
          uid: result.user.uid,
          isAnonymous: result.user.isAnonymous,
        })

        setStatus("success")
      } catch (err: any) {
        console.error("Firebase test error:", err)
        setError(err.message)
        setStatus("error")
      }
    }

    testFirebase()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Test Page</h1>

      {status === "loading" && <p>Testing Firebase connection...</p>}

      {status === "success" && (
        <div className="p-4 bg-green-100 rounded">
          <p className="text-green-800 font-medium">Firebase initialized successfully!</p>
          {user && (
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">{JSON.stringify(user, null, 2)}</pre>
          )}
        </div>
      )}

      {status === "error" && (
        <div className="p-4 bg-red-100 rounded">
          <p className="text-red-800 font-medium">Firebase initialization failed</p>
          {error && <p className="mt-2 text-sm">{error}</p>}
        </div>
      )}
    </div>
  )
}
