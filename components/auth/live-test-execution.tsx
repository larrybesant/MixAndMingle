"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Loader2, Play, Clock, Database, AlertTriangle } from "lucide-react"
import { signUpWithEmail, getUserData } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

interface TestResult {
  step: string
  status: "pending" | "running" | "success" | "error"
  message: string
  startTime?: number
  endTime?: number
  duration?: number
  data?: any
}

export default function LiveTestExecution() {
  const { refreshUserData } = useAuth()
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<TestResult[]>([])
  const [testData, setTestData] = useState({
    firstName: "Test",
    lastName: "User",
    email: "",
    username: "",
    password: "TestPassword123!",
  })
  const [executionLog, setExecutionLog] = useState<string[]>([])
  const [totalStartTime, setTotalStartTime] = useState(0)
  const [totalEndTime, setTotalEndTime] = useState(0)

  // Add this useEffect after the existing state declarations
  useEffect(() => {
    // Auto-execute the test when component mounts
    const autoExecute = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Brief delay for UI to render
      executeAutomatedTest()
    }

    autoExecute()
  }, [])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setExecutionLog((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const generateUniqueTestData = () => {
    const timestamp = Date.now()
    const newData = {
      firstName: "Test",
      lastName: "User",
      email: `test.user.${timestamp}@example.com`,
      username: `testuser${timestamp}`,
      password: "TestPassword123!",
    }
    setTestData(newData)
    addLog(`Generated test data: ${newData.email}`)
    return newData
  }

  const updateResult = (index: number, updates: Partial<TestResult>) => {
    setResults((prev) => prev.map((result, i) => (i === index ? { ...result, ...updates } : result)))
  }

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const executeAutomatedTest = async () => {
    setIsExecuting(true)
    setCurrentStep(0)
    setProgress(0)
    setResults([])
    setExecutionLog([])
    setTotalStartTime(Date.now())

    addLog("🚀 Starting automated signup test execution...")

    const steps = [
      "Generate Test Data",
      "Validate Form Fields",
      "Create Firebase Auth Account",
      "Verify Firestore Document",
      "Check Data Consistency",
      "Validate Default Settings",
    ]

    // Initialize results array
    const initialResults = steps.map((step) => ({
      step,
      status: "pending" as const,
      message: "Waiting to execute...",
    }))
    setResults(initialResults)

    try {
      // Step 1: Generate Test Data
      addLog("📝 Step 1: Generating unique test credentials...")
      setCurrentStep(0)
      updateResult(0, { status: "running", message: "Generating unique test data...", startTime: Date.now() })

      await delay(800)
      const generatedData = generateUniqueTestData()

      updateResult(0, {
        status: "success",
        message: `Generated test data for ${generatedData.email}`,
        endTime: Date.now(),
        duration: Date.now() - (results[0]?.startTime || Date.now()),
        data: generatedData,
      })
      setProgress(16.67)
      addLog(`✅ Test data generated successfully`)

      // Step 2: Validate Form Fields
      addLog("🔍 Step 2: Validating form fields...")
      setCurrentStep(1)
      updateResult(1, { status: "running", message: "Validating form data...", startTime: Date.now() })

      await delay(600)

      const validation = {
        hasFirstName: !!generatedData.firstName,
        hasLastName: !!generatedData.lastName,
        hasValidEmail: !!generatedData.email && generatedData.email.includes("@") && generatedData.email.includes("."),
        hasUsername: !!generatedData.username && generatedData.username.length >= 3,
        hasStrongPassword: !!generatedData.password && generatedData.password.length >= 8,
      }

      const isValid = Object.values(validation).every((v) => v)

      updateResult(1, {
        status: isValid ? "success" : "error",
        message: isValid ? "All form fields are valid" : "Form validation failed",
        endTime: Date.now(),
        duration: Date.now() - (results[1]?.startTime || Date.now()),
        data: validation,
      })
      setProgress(33.33)
      addLog(isValid ? "✅ Form validation passed" : "❌ Form validation failed")

      if (!isValid) {
        throw new Error("Form validation failed")
      }

      // Step 3: Create Firebase Auth Account
      addLog("🔐 Step 3: Creating Firebase Authentication account...")
      setCurrentStep(2)
      updateResult(2, { status: "running", message: "Creating Firebase Auth account...", startTime: Date.now() })

      const authStartTime = Date.now()
      addLog("📡 Calling Firebase signUpWithEmail...")

      const { user: newUser, userData: newUserData } = await signUpWithEmail(
        generatedData.email,
        generatedData.password,
        generatedData.firstName,
        generatedData.lastName,
        generatedData.username,
      )

      const authDuration = Date.now() - authStartTime
      addLog(`🎉 Firebase Auth account created in ${authDuration}ms`)

      updateResult(2, {
        status: "success",
        message: `Firebase Auth account created (${authDuration}ms)`,
        endTime: Date.now(),
        duration: authDuration,
        data: {
          uid: newUser.uid,
          email: newUser.email,
          displayName: newUser.displayName,
          emailVerified: newUser.emailVerified,
          creationTime: newUser.metadata.creationTime,
          authDuration,
        },
      })
      setProgress(50)

      // Step 4: Verify Firestore Document
      addLog("💾 Step 4: Verifying Firestore document creation...")
      setCurrentStep(3)
      updateResult(3, { status: "running", message: "Checking Firestore document...", startTime: Date.now() })

      addLog("⏳ Waiting for Firestore sync (1.5 seconds)...")
      await delay(1500) // Give Firestore time to sync

      const firestoreStartTime = Date.now()
      addLog("🔍 Querying Firestore for user document...")

      const firestoreUserData = await getUserData(newUser.uid)
      const firestoreDuration = Date.now() - firestoreStartTime

      if (firestoreUserData) {
        addLog(`✅ Firestore document found in ${firestoreDuration}ms`)
        updateResult(3, {
          status: "success",
          message: `Firestore document verified (${firestoreDuration}ms)`,
          endTime: Date.now(),
          duration: firestoreDuration,
          data: {
            uid: firestoreUserData.uid,
            displayName: firestoreUserData.displayName,
            firstName: firestoreUserData.firstName,
            lastName: firestoreUserData.lastName,
            username: firestoreUserData.username,
            email: firestoreUserData.email,
            subscriptionTier: firestoreUserData.subscriptionTier,
            firestoreDuration,
          },
        })
      } else {
        addLog("❌ Firestore document not found")
        throw new Error("Firestore document not found")
      }
      setProgress(66.67)

      // Step 5: Check Data Consistency
      addLog("🔄 Step 5: Checking data consistency between Auth and Firestore...")
      setCurrentStep(4)
      updateResult(4, { status: "running", message: "Verifying data consistency...", startTime: Date.now() })

      await delay(500)

      const consistencyChecks = {
        uidMatch: newUser.uid === firestoreUserData.uid,
        emailMatch: newUser.email === firestoreUserData.email,
        displayNameMatch: newUser.displayName === firestoreUserData.displayName,
        firstNameMatch: generatedData.firstName === firestoreUserData.firstName,
        lastNameMatch: generatedData.lastName === firestoreUserData.lastName,
        usernameMatch: generatedData.username === firestoreUserData.username,
      }

      const allConsistent = Object.values(consistencyChecks).every((check) => check)
      const inconsistentFields = Object.entries(consistencyChecks)
        .filter(([_, isConsistent]) => !isConsistent)
        .map(([field]) => field)

      addLog(allConsistent ? "✅ All data is consistent" : `❌ Inconsistent fields: ${inconsistentFields.join(", ")}`)

      updateResult(4, {
        status: allConsistent ? "success" : "error",
        message: allConsistent
          ? "All data is consistent between Auth and Firestore"
          : `Data inconsistency in: ${inconsistentFields.join(", ")}`,
        endTime: Date.now(),
        duration: Date.now() - (results[4]?.startTime || Date.now()),
        data: {
          checks: consistencyChecks,
          inconsistentFields,
          authData: {
            uid: newUser.uid,
            email: newUser.email,
            displayName: newUser.displayName,
          },
          firestoreData: {
            uid: firestoreUserData.uid,
            email: firestoreUserData.email,
            displayName: firestoreUserData.displayName,
            firstName: firestoreUserData.firstName,
            lastName: firestoreUserData.lastName,
            username: firestoreUserData.username,
          },
        },
      })
      setProgress(83.33)

      // Step 6: Validate Default Settings
      addLog("⚙️ Step 6: Validating default settings and initialization...")
      setCurrentStep(5)
      updateResult(5, { status: "running", message: "Checking default settings...", startTime: Date.now() })

      await delay(500)

      const defaultsCheck = {
        subscriptionTierCorrect: firestoreUserData.subscriptionTier === "free",
        notificationsEnabled: firestoreUserData.settings?.notifications?.messages === true,
        profileVisible: firestoreUserData.settings?.privacy?.profileVisible === true,
        statsInitialized: typeof firestoreUserData.stats?.messagesSent === "number",
        settingsObjectExists: !!firestoreUserData.settings?.notifications && !!firestoreUserData.settings?.privacy,
      }

      const defaultsCorrect = Object.values(defaultsCheck).every((check) => check)
      const incorrectDefaults = Object.entries(defaultsCheck)
        .filter(([_, isCorrect]) => !isCorrect)
        .map(([field]) => field)

      addLog(
        defaultsCorrect
          ? "✅ All default settings are correct"
          : `❌ Incorrect defaults: ${incorrectDefaults.join(", ")}`,
      )

      updateResult(5, {
        status: defaultsCorrect ? "success" : "error",
        message: defaultsCorrect
          ? "All default settings applied correctly"
          : `Incorrect defaults: ${incorrectDefaults.join(", ")}`,
        endTime: Date.now(),
        duration: Date.now() - (results[5]?.startTime || Date.now()),
        data: {
          checks: defaultsCheck,
          incorrectDefaults,
          actualSettings: {
            subscriptionTier: firestoreUserData.subscriptionTier,
            notifications: firestoreUserData.settings?.notifications,
            privacy: firestoreUserData.settings?.privacy,
            stats: firestoreUserData.stats,
          },
        },
      })
      setProgress(100)

      setTotalEndTime(Date.now())
      const totalDuration = Date.now() - totalStartTime
      addLog(`🎉 Test completed successfully in ${totalDuration}ms`)
      addLog("🔄 Refreshing authentication context...")

      // Refresh auth context
      await refreshUserData()
      addLog("✅ Authentication context refreshed")
    } catch (error: any) {
      const errorTime = Date.now()
      addLog(`❌ Test failed: ${error.message}`)

      updateResult(currentStep, {
        status: "error",
        message: `Error: ${error.message}`,
        endTime: errorTime,
        duration: errorTime - (results[currentStep]?.startTime || errorTime),
        data: { error: error.message, stack: error.stack },
      })
      setTotalEndTime(errorTime)
    }

    setIsExecuting(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "running":
        return <Badge className="bg-blue-100 text-blue-800">Running...</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const successCount = results.filter((r) => r.status === "success").length
  const errorCount = results.filter((r) => r.status === "error").length
  const totalDuration = totalEndTime - totalStartTime

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-6 w-6 text-purple-600" />
            <span>🔥 Live Test Execution Monitor</span>
          </CardTitle>
          <CardDescription>
            Real-time automated signup test with detailed monitoring and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={executeAutomatedTest} disabled={isExecuting} size="lg" className="w-full">
            {isExecuting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />🔥 EXECUTING LIVE TEST... (Step {currentStep + 1}/6)
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />🚀 Execute Another Test
              </>
            )}
          </Button>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Test Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full h-3" />
          </div>

          {/* Test Data Preview */}
          {testData.email && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">🧪 Test Credentials</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <strong>Email:</strong> {testData.email}
                  </div>
                  <div>
                    <strong>Username:</strong> @{testData.username}
                  </div>
                  <div>
                    <strong>Name:</strong> {testData.firstName} {testData.lastName}
                  </div>
                  <div>
                    <strong>Password:</strong> {testData.password}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-gray-600">Steps Passed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-gray-600">Steps Failed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{totalDuration}ms</div>
              <div className="text-sm text-gray-600">Total Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Database className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {results.find((r) => r.step === "Verify Firestore Document")?.duration || 0}ms
              </div>
              <div className="text-sm text-gray-600">Firestore Speed</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Step Results */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Test Step Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg ${
                    currentStep === index && isExecuting ? "ring-2 ring-blue-300 bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">
                        {index + 1}. {result.step}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {result.duration && (
                        <Badge variant="outline" className="text-xs">
                          {result.duration}ms
                        </Badge>
                      )}
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{result.message}</p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-purple-600 hover:text-purple-800">
                        View Data
                      </summary>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto max-h-32 overflow-y-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Execution Log */}
          <Card>
            <CardHeader>
              <CardTitle>📝 Live Execution Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                {executionLog.length === 0 ? (
                  <div className="text-gray-500">Waiting for test execution...</div>
                ) : (
                  executionLog.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
                {isExecuting && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Executing...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Final Status */}
      {progress === 100 && !isExecuting && (
        <Alert className={errorCount > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          {errorCount > 0 ? (
            <>
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Test Completed with {errorCount} Error(s)</strong> - Check the results above for details.
              </AlertDescription>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>🎉 Test Completed Successfully!</strong> All steps passed. Firebase authentication and Firestore
                integration are working perfectly. Total execution time: {totalDuration}ms
              </AlertDescription>
            </>
          )}
        </Alert>
      )}
    </div>
  )
}
