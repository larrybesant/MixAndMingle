"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) throw resetError

      setSuccess(true)
    } catch (err: any) {
      console.error("Password reset error:", err)
      setError(err.message || "Failed to send password reset email. Please try again.")
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
          <CardDescription className="text-gray-400">Reset your password</CardDescription>
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
              <AlertTitle>Email Sent</AlertTitle>
              <AlertDescription>
                If an account exists with this email, you will receive password reset instructions shortly. Please check
                your inbox and spam folder.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-700 bg-gray-800"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
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
