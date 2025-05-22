"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

// Validation schema for login form
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type FormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, user, loading: authLoading, error: authError, clearError } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const redirectPath = searchParams.get("from") || "/"
  const resetSuccess = searchParams.get("reset") === "success"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading && !isSubmitting) {
      router.push(redirectPath)
    }
  }, [user, authLoading, isSubmitting, router, redirectPath])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setLoginError(null)
    setDebugInfo(null)

    try {
      // Add a timeout to prevent UI freezing
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Login request timed out")), 15000),
      )

      const loginPromise = signIn(data.email, data.password)

      // Race between login and timeout
      const result = (await Promise.race([loginPromise, timeoutPromise])) as any

      if (result.error) {
        setLoginError(result.error.message || "Failed to sign in. Please try again.")

        // Collect debug info
        setDebugInfo(
          JSON.stringify({
            errorCode: result.error.code,
            timestamp: new Date().toISOString(),
            browser: navigator.userAgent,
          }),
        )
      } else if (result.user) {
        // Successful login
        router.push(redirectPath)
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setLoginError(error.message || "An unexpected error occurred. Please try again.")

      // Collect debug info
      setDebugInfo(
        JSON.stringify({
          errorType: error.name,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
          browser: navigator.userAgent,
        }),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Loading</CardTitle>
            <CardDescription>Please wait while we initialize authentication...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          {(loginError || authError) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{loginError || authError}</AlertDescription>
              {debugInfo && (
                <details className="mt-2 text-xs">
                  <summary>Debug Info</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{debugInfo}</pre>
                </details>
              )}
            </Alert>
          )}

          {resetSuccess && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Password Reset Successful</AlertTitle>
              <AlertDescription className="text-green-700">
                Your password has been reset successfully. You can now sign in with your new password.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                autoComplete="email"
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" {...register("password")} autoComplete="current-password" />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
