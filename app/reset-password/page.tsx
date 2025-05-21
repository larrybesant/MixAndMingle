"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { usePasswordReset } from "@/hooks/use-password-reset"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [validationError, setValidationError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [email, setEmail] = useState("")
  const [oobCode, setOobCode] = useState("")
  const [isValidCode, setIsValidCode] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)

  const searchParams = useSearchParams()
  const router = useRouter()
  const { confirmReset, verifyResetCode, loading, error } = usePasswordReset()

  useEffect(() => {
    const code = searchParams.get("oobCode")

    if (!code) {
      setIsVerifying(false)
      return
    }

    setOobCode(code)

    const verifyCode = async () => {
      try {
        const email = await verifyResetCode(code)
        setEmail(email)
        setIsValidCode(true)
      } catch (error) {
        console.error("Invalid or expired code:", error)
        setIsValidCode(false)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyCode()
  }, [searchParams, verifyResetCode])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setValidationError("")

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters")
      return
    }

    try {
      await confirmReset(oobCode, password)
      setIsSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error) {
      console.error("Error resetting password:", error)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-dark-gradient flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-muted/30 backdrop-blur-sm p-8 rounded-xl border border-border">
          <h1 className="text-2xl font-bold mb-6 text-center">Verifying Reset Link</h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <p className="text-center mt-4 text-muted-foreground">Please wait while we verify your reset link...</p>
        </div>
      </div>
    )
  }

  if (!isValidCode && !isVerifying) {
    return (
      <div className="min-h-screen bg-dark-gradient flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-muted/30 backdrop-blur-sm p-8 rounded-xl border border-border">
          <h1 className="text-2xl font-bold mb-6 text-center">Invalid Reset Link</h1>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>This password reset link is invalid or has expired.</AlertDescription>
          </Alert>
          <div className="mt-6">
            <Link href="/forgot-password">
              <Button className="w-full">Request a new reset link</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gradient flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-muted/30 backdrop-blur-sm p-8 rounded-xl border border-border mt-12">
          <div className="mb-6">
            <Link href="/login" className="text-primary hover:underline inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h1>

          {isSuccess ? (
            <div className="space-y-4">
              <Alert className="bg-green-500/10 border-green-500/30 text-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Your password has been successfully reset!</AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground mt-4">
                You will be redirected to the login page in a few seconds...
              </p>
              <div className="mt-6">
                <Link href="/login">
                  <Button className="w-full">Go to Login</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}

              {validationError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              <p className="text-sm text-muted-foreground mb-6">
                Create a new password for <strong>{email}</strong>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      <footer className="mt-auto border-t border-border/40 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-foreground/60">
            © {new Date().getFullYear()} Mix & Mingle. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
