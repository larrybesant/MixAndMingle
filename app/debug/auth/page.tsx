"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase-client-safe"

export default function AuthDebugPage() {
  const [email, setEmail] = useState("")
  const [customActionUrl, setCustomActionUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [authDomains, setAuthDomains] = useState<string[]>([])

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const actionUrl = customActionUrl || window.location.origin + "/auth/action"
      console.log(`Sending password reset email to ${email} with action URL: ${actionUrl}`)

      await sendPasswordResetEmail(auth, email, {
        url: actionUrl,
        handleCodeInApp: false,
      })

      setResult({
        success: true,
        message: `Reset email sent to ${email} with action URL: ${actionUrl}`,
      })
    } catch (error: any) {
      console.error("Error sending reset email:", error)
      setResult({
        success: false,
        message: `Error: ${error.message || "Unknown error"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkAuthDomains = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // This is just a placeholder - in a real app, you'd need to call a server endpoint
      // that uses the Firebase Admin SDK to fetch authorized domains
      setAuthDomains([
        window.location.hostname,
        "localhost",
        // Add any other domains you know are authorized
      ])

      setResult({
        success: true,
        message: "Domains list updated (note: this is a simulated list)",
      })
    } catch (error: any) {
      setResult({
        success: false,
        message: `Error: ${error.message || "Unknown error"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black p-8">
      <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-indigo-900/50">
        <h1 className="text-2xl font-bold mb-6 text-white">Firebase Authentication Debug</h1>

        {result && (
          <Alert
            className={
              result.success
                ? "bg-green-500/10 border-green-500/30 text-green-400 mb-6"
                : "bg-red-500/10 border-red-500/30 text-red-400 mb-6"
            }
          >
            {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          <div className="p-4 border border-indigo-900/50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">Test Password Reset Email</h2>
            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="bg-black/50 border-indigo-900/50 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actionUrl" className="text-gray-200">
                  Custom Action URL (optional)
                </Label>
                <Input
                  id="actionUrl"
                  type="url"
                  value={customActionUrl}
                  onChange={(e) => setCustomActionUrl(e.target.value)}
                  placeholder={`${window.location.origin}/auth/action`}
                  className="bg-black/50 border-indigo-900/50 text-white"
                />
                <p className="text-xs text-gray-400">
                  Leave blank to use default: {window.location.origin}/auth/action
                </p>
              </div>

              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Test Reset Email"}
              </Button>
            </form>
          </div>

          <div className="p-4 border border-indigo-900/50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">Firebase Configuration</h2>
            <div className="space-y-2 mb-4">
              <p className="text-gray-300">
                <strong>API Key:</strong>{" "}
                <span className="text-gray-400">
                  {process.env.NEXT_PUBLIC_FIREBASE_API_KEY
                    ? `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 5)}...`
                    : "Not set"}
                </span>
              </p>
              <p className="text-gray-300">
                <strong>Auth Domain:</strong>{" "}
                <span className="text-gray-400">{process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "Not set"}</span>
              </p>
              <p className="text-gray-300">
                <strong>Project ID:</strong>{" "}
                <span className="text-gray-400">{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Not set"}</span>
              </p>
              <p className="text-gray-300">
                <strong>Current Origin:</strong> <span className="text-gray-400">{window.location.origin}</span>
              </p>
            </div>

            <Button onClick={checkAuthDomains} className="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
              {isLoading ? "Checking..." : "Check Authorized Domains"}
            </Button>

            {authDomains.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-semibold mb-2 text-white">Authorized Domains:</h3>
                <ul className="list-disc pl-5 text-gray-400">
                  {authDomains.map((domain, index) => (
                    <li key={index}>{domain}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
