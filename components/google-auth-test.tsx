"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export function GoogleAuthTest() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")
  const { signInWithGoogle } = useAuth()

  const testGoogleAuth = async () => {
    try {
      setStatus("loading")
      setMessage("Attempting to sign in with Google...")

      const result = await signInWithGoogle()

      setStatus("success")
      setMessage(`Successfully authenticated with Google. User ID: ${result.user.uid}`)
    } catch (error: any) {
      console.error("Google auth test error:", error)
      setStatus("error")
      setMessage(`Error: ${error.code || ""} - ${error.message}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Authentication Test</CardTitle>
        <CardDescription>Test your Google authentication configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testGoogleAuth} disabled={status === "loading"} className="w-full">
          {status === "loading" ? "Testing..." : "Test Google Auth"}
        </Button>

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
