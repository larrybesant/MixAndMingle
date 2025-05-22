"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import {
  subscribeToBetaCount,
  incrementBetaTesterCount,
  markUserAsBetaTester,
  isUserBetaTester,
  MAX_BETA_TESTERS,
} from "@/lib/firebase/beta-access"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export default function BetaLogin() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [betaCount, setBetaCount] = useState<number | null>(null)
  const [passcode, setPasscode] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accessGranted, setAccessGranted] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  // Check if user is already a beta tester
  useEffect(() => {
    async function checkBetaStatus() {
      if (!user) {
        setIsCheckingStatus(false)
        return
      }

      try {
        const isBetaTester = await isUserBetaTester(user.uid)
        if (isBetaTester) {
          setAccessGranted(true)
          // Redirect to beta dashboard after a short delay
          setTimeout(() => {
            router.push("/beta/dashboard")
          }, 2000)
        }
      } catch (error) {
        console.error("Error checking beta status:", error)
      } finally {
        setIsCheckingStatus(false)
      }
    }

    if (!authLoading) {
      checkBetaStatus()
    }
  }, [user, authLoading, router])

  // Subscribe to real-time beta count updates
  useEffect(() => {
    const unsubscribe = subscribeToBetaCount((count) => {
      setBetaCount(count)
    })

    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setMessage("You must be logged in to join the beta")
      setMessageType("error")
      return
    }

    setIsSubmitting(true)
    setMessage("")
    setMessageType("")

    try {
      // Validate the passcode via API
      const response = await fetch("/api/beta/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: passcode }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || "Failed to validate beta code")
        setMessageType("error")
        return
      }

      // Increment the beta tester count
      await incrementBetaTesterCount()

      // Mark the user as a beta tester
      await markUserAsBetaTester(user.uid)

      // Set access granted
      setAccessGranted(true)
      setMessage("Access granted! Welcome to the beta.")
      setMessageType("success")

      // Redirect to beta dashboard after a short delay
      setTimeout(() => {
        router.push("/beta/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error during beta login:", error)
      setMessage("An error occurred. Please try again.")
      setMessageType("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking auth and beta status
  if (authLoading || isCheckingStatus) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Checking beta access status...</p>
        </div>
      </div>
    )
  }

  // If user is not logged in, prompt them to log in
  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Beta Access</CardTitle>
          <CardDescription>You need to log in before you can join the beta program.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => router.push("/login?from=beta")}>
            Log In to Continue
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      {!accessGranted ? (
        <>
          <CardHeader>
            <CardTitle>Mix & Mingle Beta</CardTitle>
            <CardDescription>
              We're accepting the first {MAX_BETA_TESTERS} beta testers to try our new platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {betaCount !== null && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Beta Testers</span>
                  <span className="font-medium">
                    {betaCount} / {MAX_BETA_TESTERS}
                  </span>
                </div>
                <Progress value={(betaCount / MAX_BETA_TESTERS) * 100} />
              </div>
            )}

            {betaCount !== null && betaCount >= MAX_BETA_TESTERS ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Beta testing enrollment is full. Please check back for future updates.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="passcode" className="text-sm font-medium">
                    Beta Passcode
                  </label>
                  <Input
                    id="passcode"
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter your beta passcode"
                    disabled={isSubmitting}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting || !passcode.trim()}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Join Beta"
                  )}
                </Button>
              </form>
            )}

            {message && messageType && (
              <Alert variant={messageType === "error" ? "destructive" : "default"}>
                {messageType === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Welcome to Mix & Mingle Beta!</CardTitle>
            <CardDescription>You now have access to the beta testing environment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Beta access granted! Redirecting you to the beta dashboard...</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/beta/dashboard")}>
              Go to Beta Dashboard
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
