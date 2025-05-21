"use client"

import { useState, useEffect } from "react"
import { auth, db } from "@/lib/firebase-client-safe"
import { collection, getDocs, limit, query } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Info } from "lucide-react"

export function FirebaseConnectionTest() {
  const [authStatus, setAuthStatus] = useState<"loading" | "connected" | "error">("loading")
  const [dbStatus, setDbStatus] = useState<"loading" | "connected" | "error">("loading")
  const [authError, setAuthError] = useState<string | null>(null)
  const [dbError, setDbError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Test Auth connection
    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          console.log("Auth connection successful", user ? "User logged in" : "No user")
          setAuthStatus("connected")
        },
        (error) => {
          console.error("Auth connection error:", error)
          setAuthStatus("error")
          setAuthError(error.message)
        },
      )

      return () => unsubscribe()
    } catch (error: any) {
      console.error("Auth setup error:", error)
      setAuthStatus("error")
      setAuthError(error.message)
    }
  }, [])

  useEffect(() => {
    // Test Firestore connection
    async function testFirestore() {
      try {
        const q = query(collection(db, "users"), limit(1))
        await getDocs(q)
        console.log("Firestore connection successful")
        setDbStatus("connected")
      } catch (error: any) {
        console.error("Firestore connection error:", error)
        setDbStatus("error")
        setDbError(error.message)
      }
    }

    testFirestore()
  }, [])

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Firebase Connection Status</h3>

      <div className="flex items-center gap-2">
        <span className="font-medium">Authentication:</span>
        {authStatus === "loading" && <span className="text-yellow-500">Checking...</span>}
        {authStatus === "connected" && (
          <span className="text-green-500 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" /> Connected
          </span>
        )}
        {authStatus === "error" && (
          <span className="text-red-500 flex items-center gap-1">
            <XCircle className="h-4 w-4" /> Error
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">Firestore:</span>
        {dbStatus === "loading" && <span className="text-yellow-500">Checking...</span>}
        {dbStatus === "connected" && (
          <span className="text-green-500 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" /> Connected
          </span>
        )}
        {dbStatus === "error" && (
          <span className="text-red-500 flex items-center gap-1">
            <XCircle className="h-4 w-4" /> Error
          </span>
        )}
      </div>

      <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)} className="mt-2">
        {showDetails ? "Hide Details" : "Show Details"}
      </Button>

      {showDetails && (
        <div className="space-y-2">
          {(authStatus === "error" || dbStatus === "error") && (
            <Alert variant="destructive">
              <AlertTitle>Connection Errors</AlertTitle>
              <AlertDescription>
                {authError && (
                  <div className="mb-2">
                    <strong>Auth Error:</strong> {authError}
                  </div>
                )}
                {dbError && (
                  <div>
                    <strong>Firestore Error:</strong> {dbError}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Firebase Configuration</AlertTitle>
            <AlertDescription>
              <div className="font-mono text-xs mt-2">
                <div>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✓ Set" : "✗ Missing"}</div>
                <div>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✓ Set" : "✗ Missing"}</div>
                <div>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓ Set" : "✗ Missing"}</div>
                <div>Storage Bucket: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✓ Set" : "✗ Missing"}</div>
                <div>
                  Messaging Sender ID: {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "✓ Set" : "✗ Missing"}
                </div>
                <div>App ID: {process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✓ Set" : "✗ Missing"}</div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
