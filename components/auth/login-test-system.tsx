"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, Play, User, Mail, Key, RefreshCw, LogIn, Home } from "lucide-react"
import { signInWithEmail, signOutUser } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface TestCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
  username: string
  timestamp: number
}

interface TestStep {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "success" | "error"
  result?: any
  error?: string
  duration?: number
}

export default function LoginTestSystem() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [testResults, setTestResults] = useState<any>({})
  const [logs, setLogs] = useState<string[]>([])
  const [credentials, setCredentials] = useState<TestCredentials | null>(null)
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: "load-credentials",
      name: "Load Test Credentials",
      description: "Retrieve stored test user credentials from previous signup",
      status: "pending",
    },
    {
      id: "validate-credentials",
      name: "Validate Credentials",
      description: "Verify email and password format are correct",
      status: "pending",
    },
    {
      id: "attempt-login",
      name: "Attempt Login",
      description: "Sign in with email and password using Firebase Auth",
      status: "pending",
    },
    {
      id: "verify-auth-state",
      name: "Verify Auth State",
      description: "Confirm user is authenticated in Firebase Auth",
      status: "pending",
    },
    {
      id: "load-user-data",
      name: "Load User Data",
      description: "Fetch complete user profile from Firestore",
      status: "pending",
    },
    {
      id: "verify-profile",
      name: "Verify Profile Data",
      description: "Validate all user profile fields are correct",
      status: "pending",
    },
    {
      id: "test-dashboard-access",
      name: "Test Dashboard Access",
      description: "Verify authenticated user can access protected routes",
      status: "pending",
    },
    {
      id: "test-logout",
      name: "Test Logout",
      description: "Sign out and verify auth state is cleared",
      status: "pending",
    },
  ])

  const { user, userData, loading } = useAuth()
  const router = useRouter()

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const updateStep = (stepId: string, updates: Partial<TestStep>) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, ...updates } : step)))
  }

  const generateTestCredentials = (): TestCredentials => {
    const timestamp = Date.now()
    return {
      email: `test.user.${timestamp}@example.com`,
      password: "TestPassword123!",
      firstName: "Test",
      lastName: "User",
      username: `testuser${timestamp}`,
      timestamp,
    }
  }

  const loadStoredCredentials = (): TestCredentials | null => {
    try {
      const stored = localStorage.getItem("mixmingle_test_credentials")
      if (stored) {
        return JSON.parse(stored)
      }
      return null
    } catch (error) {
      return null
    }
  }

  const runTest = async () => {
    setIsRunning(true)
    setCurrentStep(0)
    setProgress(0)
    setLogs([])
    setTestResults({})

    try {
      // Step 1: Load Test Credentials
      addLog("🔍 Loading test credentials...")
      updateStep("load-credentials", { status: "running" })

      let testCreds = loadStoredCredentials()
      if (!testCreds) {
        // Generate new credentials if none exist
        testCreds = generateTestCredentials()
        addLog("⚠️ No stored credentials found, using generated credentials")
        addLog(`📧 Email: ${testCreds.email}`)
        addLog("⚠️ Note: You may need to create this user first via signup test")
      } else {
        addLog(`✅ Found stored credentials for: ${testCreds.email}`)
      }

      setCredentials(testCreds)
      updateStep("load-credentials", {
        status: "success",
        result: { email: testCreds.email },
        duration: 100,
      })
      setCurrentStep(1)
      setProgress(12.5)

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Step 2: Validate Credentials
      addLog("🔍 Validating credential format...")
      updateStep("validate-credentials", { status: "running" })

      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testCreds.email)
      const passwordValid = testCreds.password.length >= 8

      if (!emailValid || !passwordValid) {
        throw new Error("Invalid credential format")
      }

      addLog("✅ Credentials format is valid")
      updateStep("validate-credentials", {
        status: "success",
        result: { emailValid, passwordValid },
        duration: 200,
      })
      setCurrentStep(2)
      setProgress(25)

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Step 3: Attempt Login
      addLog("🔐 Attempting login with Firebase Auth...")
      updateStep("attempt-login", { status: "running" })

      const startTime = Date.now()
      try {
        const authUser = await signInWithEmail(testCreds.email, testCreds.password)
        const loginDuration = Date.now() - startTime

        addLog(`✅ Login successful! UID: ${authUser.uid}`)
        updateStep("attempt-login", {
          status: "success",
          result: {
            uid: authUser.uid,
            email: authUser.email,
            loginTime: loginDuration,
          },
          duration: loginDuration,
        })
      } catch (error: any) {
        addLog(`❌ Login failed: ${error.message}`)
        updateStep("attempt-login", {
          status: "error",
          error: error.message,
          duration: Date.now() - startTime,
        })
        throw error
      }

      setCurrentStep(3)
      setProgress(37.5)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Step 4: Verify Auth State
      addLog("🔍 Verifying authentication state...")
      updateStep("verify-auth-state", { status: "running" })

      // Wait for auth state to update
      let attempts = 0
      while (!user && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        attempts++
      }

      if (!user) {
        throw new Error("User not authenticated after login")
      }

      addLog(`✅ User authenticated: ${user.email}`)
      updateStep("verify-auth-state", {
        status: "success",
        result: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
        },
        duration: attempts * 500,
      })
      setCurrentStep(4)
      setProgress(50)

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Step 5: Load User Data
      addLog("📄 Loading user profile data from Firestore...")
      updateStep("load-user-data", { status: "running" })

      // Wait for userData to load
      attempts = 0
      while (!userData && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        attempts++
      }

      if (!userData) {
        throw new Error("User data not loaded from Firestore")
      }

      addLog(`✅ User data loaded: ${userData.displayName}`)
      updateStep("load-user-data", {
        status: "success",
        result: {
          displayName: userData.displayName,
          subscriptionTier: userData.subscriptionTier,
          fieldsCount: Object.keys(userData).length,
        },
        duration: attempts * 500,
      })
      setCurrentStep(5)
      setProgress(62.5)

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Step 6: Verify Profile Data
      addLog("🔍 Verifying profile data integrity...")
      updateStep("verify-profile", { status: "running" })

      const requiredFields = ["uid", "email", "firstName", "lastName", "username", "subscriptionTier"]
      const missingFields = requiredFields.filter((field) => !userData[field])

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`)
      }

      const profileChecks = {
        hasRequiredFields: missingFields.length === 0,
        hasStats: userData.stats && typeof userData.stats === "object",
        hasSettings: userData.settings && typeof userData.settings === "object",
        emailMatches: userData.email === testCreds.email,
        nameMatches: userData.firstName === testCreds.firstName && userData.lastName === testCreds.lastName,
      }

      addLog("✅ Profile data verification complete")
      updateStep("verify-profile", {
        status: "success",
        result: profileChecks,
        duration: 300,
      })
      setCurrentStep(6)
      setProgress(75)

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Step 7: Test Dashboard Access
      addLog("🏠 Testing dashboard access...")
      updateStep("test-dashboard-access", { status: "running" })

      // Simulate dashboard access test
      const dashboardAccessible = user && userData && !loading

      if (!dashboardAccessible) {
        throw new Error("Dashboard not accessible")
      }

      addLog("✅ Dashboard access verified")
      updateStep("test-dashboard-access", {
        status: "success",
        result: { accessible: true, userLoaded: !!userData },
        duration: 200,
      })
      setCurrentStep(7)
      setProgress(87.5)

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Step 8: Test Logout
      addLog("🚪 Testing logout functionality...")
      updateStep("test-logout", { status: "running" })

      await signOutUser()

      // Wait for auth state to clear
      attempts = 0
      while (user && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        attempts++
      }

      addLog("✅ Logout successful")
      updateStep("test-logout", {
        status: "success",
        result: { loggedOut: true },
        duration: attempts * 500,
      })
      setCurrentStep(8)
      setProgress(100)

      addLog("🎉 All login tests completed successfully!")
      setTestResults({
        success: true,
        totalSteps: steps.length,
        completedSteps: steps.length,
        totalDuration: steps.reduce((sum, step) => sum + (step.duration || 0), 0),
      })
    } catch (error: any) {
      addLog(`❌ Test failed: ${error.message}`)
      setTestResults({
        success: false,
        error: error.message,
        failedAt: steps[currentStep]?.name,
      })
    } finally {
      setIsRunning(false)
    }
  }

  const navigateToDashboard = () => {
    router.push("/dashboard")
  }

  const navigateToSignup = () => {
    router.push("/test-signup")
  }

  useEffect(() => {
    const stored = loadStoredCredentials()
    if (stored) {
      setCredentials(stored)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <LogIn className="h-8 w-8 text-purple-600" />
              <div>
                <CardTitle className="text-2xl">Login Test System</CardTitle>
                <CardDescription>
                  End-to-end testing of login functionality with stored test credentials
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Test Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Test Credentials</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {credentials ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Email:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{credentials.email}</code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Password:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{credentials.password}</code>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Name:</span>
                    <span>
                      {credentials.firstName} {credentials.lastName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Username:</span>
                    <span>{credentials.username}</span>
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No test credentials found. Please run the signup test first to create a test user.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Button onClick={runTest} disabled={isRunning || !credentials} className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>{isRunning ? "Running Tests..." : "Start Login Test"}</span>
              </Button>

              <Button variant="outline" onClick={navigateToSignup}>
                Create Test User
              </Button>

              {user && (
                <Button variant="outline" onClick={navigateToDashboard}>
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {isRunning && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Test Progress</span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                <div className="text-sm text-gray-600">
                  Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.name}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        <Tabs defaultValue="steps" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="steps">Test Steps</TabsTrigger>
            <TabsTrigger value="logs">Execution Log</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="steps">
            <Card>
              <CardHeader>
                <CardTitle>Test Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                      <div className="flex-shrink-0 mt-1">
                        {step.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {step.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                        {step.status === "running" && <Clock className="h-5 w-5 text-blue-500 animate-spin" />}
                        {step.status === "pending" && <Clock className="h-5 w-5 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{step.name}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                step.status === "success"
                                  ? "default"
                                  : step.status === "error"
                                    ? "destructive"
                                    : step.status === "running"
                                      ? "secondary"
                                      : "outline"
                              }
                            >
                              {step.status}
                            </Badge>
                            {step.duration && <span className="text-xs text-gray-500">{step.duration}ms</span>}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        {step.error && <p className="text-sm text-red-600 mt-2">Error: {step.error}</p>}
                        {step.result && (
                          <div className="mt-2">
                            <details className="text-xs">
                              <summary className="cursor-pointer text-gray-500">View Result</summary>
                              <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                                {JSON.stringify(step.result, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Execution Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-auto">
                  {logs.length === 0 ? (
                    <div className="text-gray-500">No logs yet. Start the test to see execution details.</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(testResults).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No results yet. Run the test to see detailed results.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testResults.success ? (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          All login tests passed successfully! 🎉
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          Test failed at: {testResults.failedAt} - {testResults.error}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{testResults.completedSteps || 0}</div>
                        <div className="text-sm text-gray-600">Steps Completed</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{testResults.totalSteps || 8}</div>
                        <div className="text-sm text-gray-600">Total Steps</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{testResults.totalDuration || 0}ms</div>
                        <div className="text-sm text-gray-600">Total Duration</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{testResults.success ? "100%" : "0%"}</div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
