"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePasswordReset } from "@/hooks/use-password-reset"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"
import { Logo } from "@/components/Logo"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { sendResetEmail, loading, error } = usePasswordReset()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email) return

    try {
      await sendResetEmail(email)
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error sending password reset:", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-950 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="max-w-md mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-indigo-900/50">
          <div className="mb-6">
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-6 text-center text-white">Reset Your Password</h1>

          {isSubmitted ? (
            <div className="space-y-4">
              <Alert className="bg-green-500/10 border-green-500/30 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  If an account exists with the email <strong>{email}</strong>, you will receive password reset
                  instructions.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-gray-400 mt-4">
                Please check your email and follow the instructions to reset your password. The link in the email will
                expire after 1 hour.
              </p>
              <div className="mt-6">
                <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
                  Send another reset link
                </Button>
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

              <p className="text-sm text-gray-400 mb-6">
                Enter the email address associated with your account, and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="bg-black/50 border-indigo-900/50 text-white"
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          )}

          <div className="text-center text-sm text-gray-400 mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </div>
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
