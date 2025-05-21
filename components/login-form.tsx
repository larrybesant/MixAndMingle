"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useFirebaseError } from "@/hooks/use-firebase-error"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()
  const { signInWithEmail, signInWithGoogle, signInWithFacebook } = useAuth()
  const { toast } = useToast()
  const { error, handleError, clearError } = useFirebaseError()

  // Check Firebase configuration on component mount
  useEffect(() => {
    const checkFirebaseConfig = () => {
      const requiredVars = [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_FIREBASE_APP_ID",
      ]

      const missingVars = requiredVars.filter((varName) => !process.env[varName])

      if (missingVars.length > 0) {
        setDebugInfo(`Missing environment variables: ${missingVars.join(", ")}`)
        return false
      }

      return true
    }

    checkFirebaseConfig()
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    clearError()
    setDebugInfo(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      if (!email || !password) {
        throw new Error("Email and password are required")
      }

      console.log("Attempting to sign in with email:", email)
      const result = await signInWithEmail(email, password)
      console.log("Sign in successful, user:", result?.user?.uid)

      toast({
        title: "Login successful!",
        description: "Welcome back to Mix & Mingle.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)

      // Use our error handler
      handleError(error, {
        operation: "login-form-submit",
        additionalData: { email },
      })

      // Set debug info for development
      if (process.env.NODE_ENV !== "production") {
        setDebugInfo(`Error type: ${error.name}, Code: ${error.code}, Message: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      clearError()
      setDebugInfo(null)

      console.log("Attempting to sign in with Google")
      const result = await signInWithGoogle()

      // Log successful authentication
      console.log("Google sign-in successful:", result?.user?.uid)

      toast({
        title: "Google login successful!",
        description: "Welcome to Mix & Mingle.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Google login error:", error)

      // Use our error handler
      handleError(error, {
        operation: "google-login-button",
      })

      // Set debug info for development
      if (process.env.NODE_ENV !== "production") {
        setDebugInfo(`Google sign-in error: ${error.code || ""} - ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true)
      clearError()
      setDebugInfo(null)

      console.log("Attempting to sign in with Facebook")
      await signInWithFacebook()
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Facebook login error:", error)

      // Use our error handler
      handleError(error, {
        operation: "facebook-login-button",
      })

      // Set debug info for development
      if (process.env.NODE_ENV !== "production") {
        setDebugInfo(`Facebook sign-in error: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.userMessage || error.message}</AlertDescription>
        </Alert>
      )}

      {debugInfo && process.env.NODE_ENV !== "production" && (
        <Alert variant="default" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
          <Info className="h-4 w-4" />
          <AlertTitle>Debug Information</AlertTitle>
          <AlertDescription className="font-mono text-xs break-all">{debugInfo}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="Enter your email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="Enter your password" required />
        </div>
        <div className="flex items-center justify-end">
          <Link href="/forgot-password" className="text-sm underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={handleGoogleLogin} disabled={isLoading} className="w-full">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>
        <Button variant="outline" onClick={handleFacebookLogin} disabled={isLoading} className="w-full">
          <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
          </svg>
          Facebook
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground mt-4">
        Don't have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}
