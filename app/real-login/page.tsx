"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, Github, Loader2, CheckCircle, XCircle } from "lucide-react"
import { FcGoogle } from "react-icons/fc"

export default function RealLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({})

  const { signIn, signInWithOAuth, signUp, error, clearError } = useAuth()
  const router = useRouter()

  // Test database connection
  const testDatabaseConnection = async () => {
    try {
      const response = await fetch("/api/test-db")
      const result = await response.json()
      setTestResults((prev) => ({ ...prev, database: result.success }))
      return result.success
    } catch (err) {
      setTestResults((prev) => ({ ...prev, database: false }))
      return false
    }
  }

  // Test authentication
  const testAuth = async () => {
    try {
      const response = await fetch("/api/test-auth")
      const result = await response.json()
      setTestResults((prev) => ({ ...prev, auth: result.success }))
      return result.success
    } catch (err) {
      setTestResults((prev) => ({ ...prev, auth: false }))
      return false
    }
  }

  const runSystemTests = async () => {
    setIsLoading(true)
    console.log("🧪 Running system tests...")

    await testDatabaseConnection()
    await testAuth()

    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      setErrors({ general: "Please fill in all fields" })
      return
    }

    setIsLoading(true)
    clearError()

    try {
      const { error: signInError } = await signIn(formData.email, formData.password)

      if (signInError) {
        setErrors({ general: signInError.message })
      } else {
        // Success - redirect to test dashboard
        router.push("/test-dashboard")
      }
    } catch (err) {
      setErrors({ general: "Login failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!formData.email || !formData.password) {
      setErrors({ general: "Please fill in email and password to sign up" })
      return
    }

    setIsLoading(true)
    clearError()

    try {
      const { error: signUpError } = await signUp(formData.email, formData.password)

      if (signUpError) {
        setErrors({ general: signUpError.message })
      } else {
        setErrors({ general: "Check your email for verification link!" })
      }
    } catch (err) {
      setErrors({ general: "Sign up failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setIsLoading(true)
    clearError()

    try {
      const { error: oauthError } = await signInWithOAuth(provider)

      if (oauthError) {
        setErrors({ general: `${provider} sign in failed: ${oauthError.message}` })
      }
    } catch (err) {
      setErrors({ general: `${provider} sign in failed. Please try again.` })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* System Test Panel - VERY VISIBLE */}
        <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-2 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-yellow-400">
              🧪 STEP 1: TEST YOUR SYSTEMS FIRST
            </CardTitle>
            <CardDescription className="text-center text-white text-lg">
              Click the big button below to test if everything is working
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={runSystemTests}
              disabled={isLoading}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  TESTING SYSTEMS...
                </>
              ) : (
                "🧪 RUN SYSTEM TESTS NOW"
              )}
            </Button>

            {/* Test Results */}
            {Object.keys(testResults).length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="text-white font-bold text-lg">TEST RESULTS:</h3>
                <div className="flex items-center justify-between p-4 bg-black/50 rounded-lg border">
                  <span className="text-lg text-white">Database Connection</span>
                  {testResults.database ? (
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="w-6 h-6 mr-2" />
                      <span className="font-bold">WORKING ✅</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-400">
                      <XCircle className="w-6 h-6 mr-2" />
                      <span className="font-bold">FAILED ❌</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between p-4 bg-black/50 rounded-lg border">
                  <span className="text-lg text-white">Authentication System</span>
                  {testResults.auth ? (
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="w-6 h-6 mr-2" />
                      <span className="font-bold">WORKING ✅</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-400">
                      <XCircle className="w-6 h-6 mr-2" />
                      <span className="font-bold">FAILED ❌</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card className="bg-black/80 border-purple-500/30">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              🎵 Real Login Test
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Sign in with your actual account to test all features
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* OAuth Buttons */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-100 text-black border-gray-300"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FcGoogle className="mr-2 h-4 w-4" />}
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("github")}
                disabled={isLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white border-gray-600"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
                Continue with GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-gray-400">Or continue with email</span>
              </div>
            </div>

            {/* Error Alert */}
            {(error || errors.general) && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general || error}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="pl-10 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In & Test App"
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={handleSignUp}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-green-400 text-green-400 hover:bg-green-400/10"
                >
                  Create New Account
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter>
            <div className="w-full text-center space-y-2">
              <p className="text-sm text-gray-400">
                After login, you'll be taken to the test dashboard where you can test:
              </p>
              <div className="text-xs text-purple-400 space-y-1">
                <div>✅ Profile creation & editing</div>
                <div>✅ Live DJ rooms & streaming</div>
                <div>✅ Matchmaking & swiping</div>
                <div>✅ Real-time messaging</div>
                <div>✅ Friend system</div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
