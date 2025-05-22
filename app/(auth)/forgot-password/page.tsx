"use client"

import { useState } from "react"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

// Validation schema for forgot password form
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type FormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)
    setDebugInfo(null)

    try {
      // Add a timeout to prevent UI freezing
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Password reset request timed out")), 15000),
      )

      const resetPromise = resetPassword(data.email)

      // Race between reset and timeout
      const result = (await Promise.race([resetPromise, timeoutPromise])) as any

      if (!result.success) {
        setSubmitError(result.error?.message || "Failed to send reset email. Please try again.")

        // Collect debug info
        setDebugInfo(
          JSON.stringify({
            errorCode: result.error?.code,
            timestamp: new Date().toISOString(),
            browser: navigator.userAgent,
          }),
        )
      } else {
        setSubmitSuccess(true)
      }
    } catch (error: any) {
      console.error("Password reset error:", error)
      setSubmitError(error.message || "An unexpected error occurred. Please try again.")

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

  if (submitSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>We've sent you a password reset link</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Email Sent</AlertTitle>
              <AlertDescription className="text-green-700">
                If an account exists with the email you entered, you will receive a password reset link shortly.
              </AlertDescription>
            </Alert>
            <div className="text-center mt-4">
              <p className="mb-4 text-sm text-muted-foreground">
                Didn't receive an email? Check your spam folder or try again.
              </p>
              <Button variant="outline" asChild>
                <Link href="/forgot-password">Try Again</Link>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link</CardDescription>
        </CardHeader>
        <CardContent>
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
              {debugInfo && (
                <details className="mt-2 text-xs">
                  <summary>Debug Info</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{debugInfo}</pre>
                </details>
              )}
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
