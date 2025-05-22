"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getFirebaseAuth } from "@/lib/firebase/firebase-client"
import { doc, setDoc, getFirestore } from "firebase/firestore"

export default function BetaPrompt() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Call the server action to verify the beta code
      const response = await fetch("/api/beta/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify beta code")
      }

      // If successful, mark the user as a beta tester in Firestore
      const auth = getFirebaseAuth()
      const user = auth.currentUser

      if (user) {
        const db = getFirestore()
        await setDoc(
          doc(db, "users", user.uid),
          {
            isBetaTester: true,
            betaAccessGrantedAt: new Date().toISOString(),
          },
          { merge: true },
        )
      }

      setSuccess(true)

      // Redirect to the main app after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Mix & Mingle Beta</CardTitle>
          <CardDescription>Enter your exclusive beta access code to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                Access granted! Redirecting you to the beta...
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <Input
                  type="text"
                  placeholder="Enter beta access code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading}
                  className="text-center text-lg tracking-wider"
                  autoComplete="off"
                />
                <Button type="submit" disabled={isLoading || !code.trim()}>
                  {isLoading ? "Verifying..." : "Enter Beta"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col text-center text-sm text-muted-foreground">
          <p>Need a beta code? Contact our team at beta@mixmingle.com</p>
        </CardFooter>
      </Card>
    </div>
  )
}
