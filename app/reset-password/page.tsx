"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidLink, setIsValidLink] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    // Check if we have a valid hash in the URL
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Session error:", error)
        setError("Invalid or expired password reset link. Please request a new one.")
        return
      }

      if (data?.session) {
        setIsValidLink(true)
      } else {
        // Check if we have hash parameters for password reset
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        if (hashParams.get("type") === "recovery") {
          setIsValidLink(true)
        } else {
          setError("Invalid or expired password reset link. Please request a new one.")
        }
      }
    }

    checkSession()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    try {
      const { error: resetError } = await supabase.auth.updateUser({
        password: password,
      })

      if (resetError) throw resetError

      setSuccess(true)

      // Redirect to sign in page after 3 seconds
      setTimeout(() => {
        router.push("/signin")
      }, 3000)
    } catch (err: any) {
      console.error("Password update error:", err)
      setError(err.message || "Failed to update password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <Card className="w-full max-w-md border-gray-800 bg-gray-900">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            <span className="text-orange-500">MIX</span> & <span className="text-blue-500">MINGLE</span>
          </CardTitle>
          <CardDescription className="text-gray-400">Set your new password</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 border-red-900 bg-red-950 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <Alert className="mb-4 border-green-900 bg-green-950 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Password Updated</AlertTitle>
              <AlertDescription>
                Your password has been successfully updated. You will be redirected to the sign in page shortly.
              </AlertDescription>
            </Alert>
          ) : isValidLink ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-700 bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-gray-700 bg-gray-800"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-400">Validating your reset link...</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-400">
            <Link href="/signin" className="flex items-center justify-center text-blue-400 hover:text-blue-300">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
