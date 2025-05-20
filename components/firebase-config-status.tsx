"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { EnvSetupGuide } from "@/components/env-setup-guide"

export function FirebaseConfigStatus() {
  const [configError, setConfigError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Firebase API key is properly set
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

    if (!apiKey || apiKey === "test-api-key") {
      setConfigError("Firebase API key is missing. Please set up your environment variables.")
    } else if (!projectId || projectId === "test-project") {
      setConfigError("Firebase Project ID is missing. Please set up your environment variables.")
    } else if (!authDomain || authDomain === "test-project.firebaseapp.com") {
      setConfigError("Firebase Auth Domain is missing. Please set up your environment variables.")
    } else {
      setConfigError(null)
    }
  }, [])

  if (!configError) return null

  return (
    <div className="container py-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Firebase Configuration Error</AlertTitle>
        <AlertDescription>
          {configError} Firebase authentication will not work until you configure your environment variables.
        </AlertDescription>
      </Alert>

      <EnvSetupGuide />
    </div>
  )
}
