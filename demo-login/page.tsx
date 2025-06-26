"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, Loader2, Play } from "lucide-react"
import Link from "next/link"

export default function DemoLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email || !password) {
      setError("Please enter both email and password.")
      setLoading(false)
      return
    }

    try {
      // Import Supabase client dynamically
      const { supabase } = await import("@/lib/supabase/client")
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        setSuccess(true)
        setError("")

        // Wait a moment then redirect
        setTimeout(() => {
          router.push("/demo-dashboard")
        }, 1000)
      }
    } catch (err: any) {
      setError(`Connection error: ${err.message || "Please try again"}`)
    } finally {
      setLoading(false)
    }
  }

  // Demo login function for preview
  const handleDemoLogin = () => {
    setSuccess(true)
    setError("")
    setTimeout(() => {
      router.push("/demo-dashboard")
    }, 1000)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
        <Card className="w-full max-w-md bg-black/80 border-green-500/30 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Login Successful!</h2>
              <p className="text-gray-400">Redirecting to your dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <Card className="w-full max-w-md bg-black/80 border-purple-500/30 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            Mix & Mingle Demo
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Experience the full app in preview mode
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/30">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {/* Demo Login Button - Primary */}
          <Button
            type="button"
            onClick={handleDemoLogin}
            className="
              w-full h-14
              bg-gradient-to-r from-green-600 to-emerald-600 
              hover:from-green-700 hover:to-emerald-700 
              text-white font-bold text-lg
              transition-all duration-200
              shadow-lg shadow-green-500/25
            "
          >
            <Play className="mr-2 h-5 w-5" />
            Start Demo Experience
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-400">Or use real login</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="
                    w-full h-12 pl-10 pr-4
                    bg-gray-900/50 
                    border-gray-600 
                    text-white 
                    placeholder-gray-400 
                    focus:border-purple-400 
                    focus:ring-purple-400
                    focus:ring-1
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                  style={{
                    cursor: loading ? "not-allowed" : "text",
                    pointerEvents: loading ? "none" : "auto",
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="
                    w-full h-12 pl-10 pr-12
                    bg-gray-900/50 
                    border-gray-600 
                    text-white 
                    placeholder-gray-400 
                    focus:border-purple-400 
                    focus:ring-purple-400
                    focus:ring-1
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                  style={{
                    cursor: loading ? "not-allowed" : "text",
                    pointerEvents: loading ? "none" : "auto",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="
                    absolute right-3 top-1/2 transform -translate-y-1/2 
                    h-4 w-4 text-gray-400 hover:text-white 
                    transition-colors duration-200
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    z-10
                  "
                  style={{
                    cursor: loading ? "not-allowed" : "pointer",
                    pointerEvents: loading ? "none" : "auto",
                  }}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !email || !password}
              variant="outline"
              className="
                w-full h-12
                border-purple-500/50 text-purple-400 
                hover:bg-purple-500/10
                transition-all duration-200
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
              style={{
                cursor: loading || !email || !password ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In with Credentials"
              )}
            </Button>
          </form>

          {/* Demo Info */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-2">Demo Features:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Complete user dashboard</li>
              <li>• Profile setup flow</li>
              <li>• Matchmaking interface</li>
              <li>• Live DJ rooms</li>
              <li>• Real-time messaging</li>
            </ul>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-purple-400 hover:text-purple-300 underline transition-colors duration-200"
            >
              Forgot your password?
            </Link>
          </div>
        </CardContent>

        <CardFooter>
          <p className="text-sm text-gray-400 text-center w-full">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-purple-400 hover:text-purple-300 underline transition-colors duration-200"
              data-testid="signup-link"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
