"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"
import { auth } from "@/lib/firebase-client-safe"
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const code = searchParams.get("oobCode")
    console.log("Reset password page loaded with oobCode:", code ? "present" : "missing")

    if (!code) {
      setIsVerifying(false)
      setError("Missing reset code. Please use the link from your email.")
      return
    }

    setOobCode(code)

    const verifyCode = async () => {
      try {
        console.log("Verifying reset code...")
        const email = await verifyPasswordResetCode(auth, code)
        console.log("Code verified for email:", email)
        setEmail(email)
        setIsValidCode(true)
      } catch (err: any) {
        console.error("Invalid or expired code:", err)
        setError(err?.message || "Invalid or expired reset code")
        setIsValidCode(false)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyCode()
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setValidationError("")
    setError(null)

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      console.log("Resetting password with code...")
      await confirmPasswordReset(auth, oobCode, password)
      console.log("Password reset successful")
      setIsSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      console.error("Error resetting password:", err)
      setError(err?.message || "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-indigo-900/50">
          <h1 className="text-2xl font-bold mb-6 text-center text-white">Verifying Reset Link</h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
          <p className="text-center mt-4 text-gray-400">Please wait while we verify your reset link...</p>
        </div>
      </div>
    )
  }

  if (!isValidCode && !isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-indigo-900/50">
          <h1 className="text-2xl font-bold mb-6 text-center text-white">Invalid Reset Link</h1>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "This password reset link is invalid or has expired."}</AlertDescription>
          </Alert>
          <div className="mt-6">
            <Link href="/forgot-password">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Request a new reset link</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-black flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-indigo-900/50 mt-12">
          <div className="mb-6">
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-6 text-center text-white">Reset Your Password</h1>

          {isSuccess ? (
            <div className="space-y-4">
              <Alert className="bg-green-500/10 border-green-500/30 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Your password has been successfully reset!</AlertDescription>
              </Alert>
              <p className="text-sm text-gray-400 mt-4">You will be redirected to the login page in a few seconds...</p>
              <div className="mt-6">
                <Link href="/login">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Go to Login</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {validationError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              <p className="text-sm text-gray-400 mb-6">
                Create a new password for <strong className="text-white">{email}</strong>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="bg-black/50 border-indigo-900/50 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-200">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="bg-black/50 border-indigo-900/50 text-white"
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      <footer className="mt-auto border-t border-indigo-900/20 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Mix & Mingle. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
