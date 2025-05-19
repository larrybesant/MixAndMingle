"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function LoginHelpPage() {
  const [email, setEmail] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<any>(null)

  const supabase = createClient()

  const checkUserStatus = async () => {
    if (!email) return

    setIsChecking(true)
    setResult(null)

    try {
      // Check if user exists
      const { data: userData, error: userError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (userError && userError.message !== "User not found") {
        throw userError
      }

      if (!userData.user) {
        setResult({
          success: false,
          message: "No account found with this email address. Please sign up first.",
        })
        return
      }

      setResult({
        success: true,
        message: "A magic link has been sent to your email. Click the link to sign in.",
      })
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "An error occurred while checking your account.",
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-6">Login Help</h1>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Can't Log In?</CardTitle>
          <CardDescription>Enter your email address and we'll help you get back into your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button onClick={checkUserStatus} disabled={isChecking || !email} className="w-full">
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Send Magic Link"
            )}
          </Button>

          <div className="text-center text-sm">
            <p className="mb-2">Other options:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup" className="text-blue-500 hover:underline">
                Create New Account
              </Link>
              <Link href="/signin" className="text-blue-500 hover:underline">
                Try Again with Password
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-8 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Common Login Issues</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Forgot Password</h3>
            <p className="text-sm text-gray-500">
              If you've forgotten your password, use the "Forgot password?" link on the sign-in page.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Email Not Confirmed</h3>
            <p className="text-sm text-gray-500">
              You might need to confirm your email address. Check your inbox for a confirmation email.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Browser Issues</h3>
            <p className="text-sm text-gray-500">
              Try clearing your browser cookies and cache, or use a different browser.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Need More Help?</h3>
            <p className="text-sm text-gray-500">Contact our support team at support@mixmingle.com for assistance.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
