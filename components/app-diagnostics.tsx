"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

export function AppDiagnostics() {
  const [envVars, setEnvVars] = useState<{ [key: string]: boolean }>({})
  const [nextInfo, setNextInfo] = useState<{ version: string | null; mode: string | null }>({
    version: null,
    mode: null,
  })
  const [browserInfo, setBrowserInfo] = useState<string | null>(null)

  useEffect(() => {
    // Check environment variables
    const requiredVars = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
    ]

    const vars: { [key: string]: boolean } = {}
    requiredVars.forEach((varName) => {
      vars[varName] = !!process.env[varName]
    })

    setEnvVars(vars)

    // Get Next.js info
    setNextInfo({
      version: process.env.NEXT_PUBLIC_VERSION || null,
      mode: process.env.NODE_ENV || null,
    })

    // Get browser info
    setBrowserInfo(navigator.userAgent)
  }, [])

  const missingVars = Object.keys(envVars).filter((key) => !envVars[key])
  const allEnvVarsPresent = missingVars.length === 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>App Diagnostics</CardTitle>
        <CardDescription>Checking system configuration and dependencies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Environment Variables:</span>
            {allEnvVarsPresent ? (
              <span className="text-green-500 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> All present
              </span>
            ) : (
              <span className="text-red-500 flex items-center gap-1">
                <XCircle className="h-4 w-4" /> Missing {missingVars.length} variables
              </span>
            )}
          </div>

          {!allEnvVarsPresent && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Missing environment variables:</div>
                <ul className="list-disc pl-5 mt-1">
                  {missingVars.map((varName) => (
                    <li key={varName}>{varName}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div>
          <div className="font-medium mb-1">System Information:</div>
          <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto">
            <div>Next.js Mode: {nextInfo.mode || "Unknown"}</div>
            <div>Next.js Version: {nextInfo.version || "Unknown"}</div>
            <div className="truncate">Browser: {browserInfo || "Unknown"}</div>
          </div>
        </div>

        <Button onClick={() => window.location.reload()} className="w-full">
          Refresh Diagnostics
        </Button>
      </CardContent>
    </Card>
  )
}
