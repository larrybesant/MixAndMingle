"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [betaCode, setBetaCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showConfirmationHelp, setShowConfirmationHelp] = useState(false)

  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validate beta code
    if (betaCode !== "MIXBETA2023") {
      setError("Invalid beta invitation code. Please check your invitation email.")
      setIsLoading(false)
      return
    }

    try {
      // Create the user in Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            is_beta_tester: true,
          },
        },
      })

      if (signUpError) throw signUpError

      // Create a profile in the profiles table
      if (data?.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            full_name: name,
            email: email,
            is_beta_tester: true,
            beta_joined_at: new Date().toISOString(),
          },
        ])

        if (profileError) throw profileError
      }

      setSuccess(true)

      // Check if email confirmation is required
      if (data?.user && !data.user.email_confirmed_at) {
        setShowConfirmationHelp(true)
      } else {
        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push("/beta-guide")
        }, 2000)
      }
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.message || "An error occurred during signup. Please try again.")
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
          <CardDescription className="text-gray-400">Create your account to join the beta test</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 border-red-900 bg-red-950 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && !showConfirmationHelp && (
            <Alert className="mb-4 border-green-900 bg-green-950 text-green-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>Your account has been created. Redirecting to the beta guide...</AlertDescription>
            </Alert>
          )}

          {showConfirmationHelp && (
            <Alert className="mb-4 border-yellow-900 bg-yellow-950 text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Check Your Email</AlertTitle>
              <AlertDescription>
                <p className="mb-2">
                  We've sent a confirmation email to <strong>{email}</strong>. Please check your inbox and click the
                  confirmation link to activate your account.
                </p>
                <p className="mb-2">If you don't see the email, please check your spam folder.</p>
                <p>Having trouble? Contact our support team at support@mixandmingle.com for assistance.</p>
                <Button variant="outline" className="mt-2" onClick={() => router.push("/signin")}>
                  Go to Sign In
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!success && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-gray-700 bg-gray-800"
                />
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="border-gray-700 bg-gray-800"
                />
                <p className="text-xs text-gray-400">Password must be at least 8 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="betaCode">Beta Invitation Code</Label>
                <Input
                  id="betaCode"
                  type="text"
                  placeholder="Enter your invitation code"
                  value={betaCode}
                  onChange={(e) => setBetaCode(e.target.value)}
                  required
                  className="border-gray-700 bg-gray-800"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </div>
          <div className="text-center text-xs text-gray-500">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
