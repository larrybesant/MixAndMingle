"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"
import { auth } from "@/lib/firebase-client-safe"

export function AuthDiagnostics() {
  const [isOpen, setIsOpen] = useState(false)
  const [diagnostics, setDiagnostics] = useState<{
    firebaseInitialized: boolean
    authInitialized: boolean
    envVariables: {
      name: string
      status: "ok" | "missing" | "partial"
      value?: string
    }[]
    networkStatus: "online" | "offline"
    authState: string
    errors: string[]
  }>({
    firebaseInitialized: false,
    authInitialized: false,
    envVariables: [],
    networkStatus: "offline",
    authState: "unknown",
    errors: [],
  })

  useEffect(() => {
    if (isOpen) {
      runDiagnostics()
    }
  }, [isOpen])

  const runDiagnostics = async () => {
    const errors: string[] = []

    // Check environment variables
    const envVars = [
      { name: "NEXT_PUBLIC_FIREBASE_API_KEY", required: true },
      { name: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", required: true },
      { name: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", required: true },
      { name: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", required: false },
      { name: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", required: false },
      { name: "NEXT_PUBLIC_FIREBASE_APP_ID", required: true },
    ]

    const envVariables = envVars.map((v) => {
      const value = process.env[v.name]
      if (!value && v.required) {
        errors.push(`Missing required environment variable: ${v.name}`)
        return { name: v.name, status: "missing" as const }
      }
      if (!value && !v.required) {
        return { name: v.name, status: "missing" as const }
      }

      // Only show first few characters of sensitive values
      const displayValue = value ? `${value.substring(0, 5)}...` : undefined
      return {
        name: v.name,
        status: "ok" as const,
        value: displayValue,
      }
    })

    // Check network status
    const networkStatus = navigator.onLine ? "online" : "offline"
    if (!navigator.onLine) {
      errors.push("Device is offline. Authentication requires internet connection.")
    }

    // Check Firebase initialization
    const firebaseInitialized = !!auth
    if (!firebaseInitialized) {
      errors.push("Firebase failed to initialize")
    }

    // Check Auth initialization
    const authInitialized = !!auth
    if (!authInitialized) {
      errors.push("Firebase Auth failed to initialize")
    }

    // Check current auth state
    let authState = "unknown"
    try {
      const currentUser = auth.currentUser
      authState = currentUser ? `Authenticated (${currentUser.email})` : "Not authenticated"
    } catch (error) {
      authState = "Error checking auth state"
      errors.push(`Auth state error: ${error}`)
    }

    setDiagnostics({
      firebaseInitialized,
      authInitialized,
      envVariables,
      networkStatus,
      authState,
      errors,
    })
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Auth Diagnostics
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
        <CardHeader>
          <CardTitle>Authentication Diagnostics</CardTitle>
          <CardDescription>Troubleshooting tool for authentication issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Firebase Status</h3>
              <div className="flex items-center">
                {diagnostics.firebaseInitialized ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span>Firebase Initialized</span>
              </div>
              <div className="flex items-center">
                {diagnostics.authInitialized ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span>Auth Initialized</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Network & Auth State</h3>
              <div className="flex items-center">
                {diagnostics.networkStatus === "online" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span>Network: {diagnostics.networkStatus}</span>
              </div>
              <div className="flex items-center">
                <Info className="h-4 w-4 text-blue-500 mr-2" />
                <span>Auth State: {diagnostics.authState}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Environment Variables</h3>
            <div className="grid grid-cols-1 gap-2">
              {diagnostics.envVariables.map((env) => (
                <div key={env.name} className="flex items-center justify-between text-xs bg-muted p-2 rounded">
                  <span className="font-mono">{env.name}</span>
                  <div className="flex items-center">
                    {env.value && <span className="font-mono mr-2">{env.value}</span>}
                    <Badge variant={env.status === "ok" ? "default" : "destructive"}>{env.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {diagnostics.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Issues Detected</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  {diagnostics.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Troubleshooting Steps</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Verify all Firebase environment variables are correctly set in your Vercel project</li>
              <li>Check that your Firebase project has Authentication enabled</li>
              <li>Ensure Email/Password authentication is enabled in Firebase Console</li>
              <li>Verify your Firebase API key is not restricted by domain</li>
              <li>Check for any Firebase console errors or warnings</li>
              <li>Try clearing browser cache and cookies</li>
              <li>Test with a different browser or device</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => runDiagnostics()}>
            Run Diagnostics Again
          </Button>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
