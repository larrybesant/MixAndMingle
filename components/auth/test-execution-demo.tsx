"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Loader2, Play, Clock, Database, AlertTriangle, Zap } from "lucide-react"
import { signUpWithEmail, getUserData } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

export default function TestExecutionDemo() {
  const { refreshUserData } = useAuth()
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [executionLog, setExecutionLog] = useState<string[]>([])
  const [testResults, setTestResults] = useState<any[]>([])
  const [testData, setTestData] = useState({
    firstName: "Test",
    lastName: "User",
    email: "",
    username: "",
    password: "TestPassword123!",
  })
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)

  const addLog = (message: string, type: "info" | "success" | "error" | "warning" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    const emoji = type === "success" ? "✅" : type === "error" ? "❌" : type === "warning" ? "⚠️" : "ℹ️"
    setExecutionLog((prev) => [...prev, `[${timestamp}] ${emoji} ${message}`])
  }

  const updateProgress = (step: number, status: string, message: string, data?: any) => {
    setCurrentStep(step)
    setProgress((step + 1) * 16.67)

    setTestResults((prev) => {
      const newResults = [...prev]
      newResults[step] = { status, message, data, timestamp: Date.now() }
      return newResults
    })
  }

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const executeTest = async () => {
    setIsExecuting(true)
    setProgress(0)
    setCurrentStep(0)
    setExecutionLog([])
    setTestResults([])
    setStartTime(Date.now())

    // Initialize test data
    const timestamp = Date.now()
    const newTestData = {
      firstName: "Test",
      lastName: "User",
      email: `test.user.${timestamp}@example.com`,
      username: `testuser${timestamp}`,
      password: "TestPassword123!",
    }
    setTestData(newTestData)

    try {
      addLog("🚀 STARTING AUTOMATED SIGNUP TEST EXECUTION", "info")
      addLog(`📧 Generated test email: ${newTestData.email}`, "info")

      // Step 1: Generate and validate test data
      addLog("📝 Step 1/6: Generating and validating test data...", "info")
      updateProgress(0, "running", "Generating unique test credentials...")
      await delay(800)

      const validation = {
        hasFirstName: !!newTestData.firstName,
        hasLastName: !!newTestData.lastName,
        hasValidEmail: newTestData.email.includes("@") && newTestData.email.includes("."),
        hasUsername: newTestData.username.length >= 3,
        hasStrongPassword: newTestData.password.length >= 8,
      }

      const isValid = Object.values(validation).every((v) => v)
      if (isValid) {
        addLog("✅ Test data validation passed", "success")
        updateProgress(0, "success", "Test data generated and validated", validation)
      } else {
        throw new Error("Test data validation failed")
      }

      // Step 2: Create Firebase Auth Account
      addLog("🔐 Step 2/6: Creating Firebase Authentication account...", "info")
      updateProgress(1, "running", "Calling Firebase signUpWithEmail...")

      const authStartTime = Date.now()
      addLog("📡 Sending request to Firebase Auth...", "info")

      const { user: newUser, userData: newUserData } = await signUpWithEmail(
        newTestData.email,
        newTestData.password,
        newTestData.firstName,
        newTestData.lastName,
        newTestData.username,
      )

      const authDuration = Date.now() - authStartTime
      addLog(`🎉 Firebase Auth account created successfully in ${authDuration}ms`, "success")
      addLog(`👤 User UID: ${newUser.uid}`, "info")
      updateProgress(1, "success", `Firebase Auth account created (${authDuration}ms)`, {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        duration: authDuration,
      })

      // Step 3: Verify Firestore Document Creation
      addLog("💾 Step 3/6: Verifying Firestore document creation...", "info")
      updateProgress(2, "running", "Waiting for Firestore sync...")

      addLog("⏳ Waiting 1.5 seconds for Firestore sync...", "warning")
      await delay(1500)

      const firestoreStartTime = Date.now()
      addLog("🔍 Querying Firestore for user document...", "info")

      const firestoreUserData = await getUserData(newUser.uid)
      const firestoreDuration = Date.now() - firestoreStartTime

      if (firestoreUserData) {
        addLog(`✅ Firestore document found and verified in ${firestoreDuration}ms`, "success")
        addLog(
          `📊 User data: ${firestoreUserData.firstName} ${firestoreUserData.lastName} (@${firestoreUserData.username})`,
          "info",
        )
        updateProgress(2, "success", `Firestore document verified (${firestoreDuration}ms)`, {
          uid: firestoreUserData.uid,
          firstName: firestoreUserData.firstName,
          lastName: firestoreUserData.lastName,
          username: firestoreUserData.username,
          subscriptionTier: firestoreUserData.subscriptionTier,
          duration: firestoreDuration,
        })
      } else {
        throw new Error("Firestore document not found")
      }

      // Step 4: Data Consistency Check
      addLog("🔄 Step 4/6: Checking data consistency between Auth and Firestore...", "info")
      updateProgress(3, "running", "Verifying data consistency...")
      await delay(500)

      const consistencyChecks = {
        uidMatch: newUser.uid === firestoreUserData.uid,
        emailMatch: newUser.email === firestoreUserData.email,
        displayNameMatch: newUser.displayName === firestoreUserData.displayName,
        firstNameMatch: newTestData.firstName === firestoreUserData.firstName,
        lastNameMatch: newTestData.lastName === firestoreUserData.lastName,
        usernameMatch: newTestData.username === firestoreUserData.username,
      }

      const allConsistent = Object.values(consistencyChecks).every((check) => check)
      if (allConsistent) {
        addLog("✅ All data is perfectly consistent between Auth and Firestore", "success")
        updateProgress(3, "success", "Data consistency verified", consistencyChecks)
      } else {
        const inconsistentFields = Object.entries(consistencyChecks)
          .filter(([_, isConsistent]) => !isConsistent)
          .map(([field]) => field)
        throw new Error(`Data inconsistency in: ${inconsistentFields.join(", ")}`)
      }

      // Step 5: Default Settings Validation
      addLog("⚙️ Step 5/6: Validating default settings and initialization...", "info")
      updateProgress(4, "running", "Checking default settings...")
      await delay(500)

      const defaultsCheck = {
        subscriptionTierCorrect: firestoreUserData.subscriptionTier === "free",
        notificationsEnabled: firestoreUserData.settings?.notifications?.messages === true,
        profileVisible: firestoreUserData.settings?.privacy?.profileVisible === true,
        statsInitialized: typeof firestoreUserData.stats?.messagesSent === "number",
        settingsComplete: !!firestoreUserData.settings?.notifications && !!firestoreUserData.settings?.privacy,
      }

      const defaultsCorrect = Object.values(defaultsCheck).every((check) => check)
      if (defaultsCorrect) {
        addLog("✅ All default settings applied correctly", "success")
        addLog(
          `📊 Subscription: ${firestoreUserData.subscriptionTier}, Notifications: enabled, Privacy: default`,
          "info",
        )
        updateProgress(4, "success", "Default settings validated", defaultsCheck)
      } else {
        const incorrectDefaults = Object.entries(defaultsCheck)
          .filter(([_, isCorrect]) => !isCorrect)
          .map(([field]) => field)
        throw new Error(`Incorrect defaults: ${incorrectDefaults.join(", ")}`)
      }

      // Step 6: Final Verification and Context Refresh
      addLog("🔄 Step 6/6: Final verification and context refresh...", "info")
      updateProgress(5, "running", "Refreshing authentication context...")
      await delay(500)

      await refreshUserData()
      addLog("✅ Authentication context refreshed successfully", "success")
      updateProgress(5, "success", "Test completed successfully", {
        totalSteps: 6,
        allPassed: true,
        newUserCreated: true,
      })

      setEndTime(Date.now())
      const totalDuration = Date.now() - startTime
      addLog(`🎉 TEST COMPLETED SUCCESSFULLY! Total execution time: ${totalDuration}ms`, "success")
      addLog("🎯 All 6 steps passed - Firebase integration is working perfectly!", "success")
    } catch (error: any) {
      const errorTime = Date.now()
      addLog(`❌ TEST FAILED: ${error.message}`, "error")
      updateProgress(currentStep, "error", `Error: ${error.message}`, { error: error.message })
      setEndTime(errorTime)
    }

    setIsExecuting(false)
  }

  // Auto-execute test when component mounts
  useEffect(() => {
    const autoExecute = async () => {
      await delay(1000) // Brief delay for UI to render
      executeTest()
    }
    autoExecute()
  }, [])

  const successCount = testResults.filter((r) => r.status === "success").length
  const errorCount = testResults.filter((r) => r.status === "error").length
  const totalDuration = endTime - startTime

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <Zap className="h-8 w-8 text-purple-600" />
            <span>🔥 LIVE TEST EXECUTION IN PROGRESS</span>
          </CardTitle>
          <CardDescription className="text-lg">
            Automated signup test running with real-time monitoring and detailed validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Test Progress</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="w-full h-4" />
              <div className="text-center text-sm text-gray-600">
                {isExecuting
                  ? `Executing Step ${currentStep + 1}/6...`
                  : progress === 100
                    ? "Test Completed!"
                    : "Ready to Execute"}
              </div>
            </div>

            {/* Test Data */}
            {testData.email && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Database className="h-4 w-4 mr-2" />🧪 Test Credentials Generated
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
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
          </div>
        </CardContent>
      </Card>

      {/* Live Results Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />📝 Live Execution Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {executionLog.length === 0 ? (
                <div className="text-gray-500">Initializing test execution...</div>
              ) : (
                executionLog.map((log, index) => (
                  <div key={index} className="mb-1 leading-relaxed">
                    {log}
                  </div>
                ))
              )}
              {isExecuting && (
                <div className="flex items-center space-x-2 mt-2 text-yellow-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Executing step {currentStep + 1}/6...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />📊 Step Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Generate & Validate Data",
              "Create Firebase Auth",
              "Verify Firestore Document",
              "Check Data Consistency",
              "Validate Default Settings",
              "Final Verification",
            ].map((stepName, index) => {
              const result = testResults[index]
              const isCurrent = currentStep === index && isExecuting

              return (
                <div
                  key={index}
                  className={`p-3 border rounded-lg ${isCurrent ? "ring-2 ring-blue-300 bg-blue-50" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {result?.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : result?.status === "error" ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : result?.status === "running" ? (
                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="font-medium text-sm">
                        {index + 1}. {stepName}
                      </span>
                    </div>
                    {result?.status === "success" ? (
                      <Badge className="bg-green-100 text-green-800 text-xs">Success</Badge>
                    ) : result?.status === "error" ? (
                      <Badge variant="destructive" className="text-xs">
                        Error
                      </Badge>
                    ) : result?.status === "running" ? (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Running...</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Pending
                      </Badge>
                    )}
                  </div>
                  {result?.message && <p className="text-xs text-gray-600">{result.message}</p>}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      {testResults.length > 0 && (
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
                {testResults.find((r) => r.data?.duration)?.data?.duration || 0}ms
              </div>
              <div className="text-sm text-gray-600">Firebase Speed</div>
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
                <strong>❌ Test Failed with {errorCount} Error(s)</strong> - Check the execution log for details.
              </AlertDescription>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>🎉 TEST COMPLETED SUCCESSFULLY!</strong> All 6 steps passed perfectly. Firebase authentication
                and Firestore integration are working flawlessly. Total execution time: {totalDuration}ms
              </AlertDescription>
            </>
          )}
        </Alert>
      )}

      {/* Control Button */}
      <Card>
        <CardContent className="p-4">
          <Button onClick={executeTest} disabled={isExecuting} size="lg" className="w-full">
            {isExecuting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />🔥 TEST EXECUTING... (Step {currentStep + 1}/6)
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />🚀 Execute Another Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
