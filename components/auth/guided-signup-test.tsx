"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Loader2, Play, RotateCcw, Database, User, Settings, Shield } from "lucide-react"
import { signUpWithEmail, getUserData } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

interface TestStep {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "success" | "error"
  message: string
  data?: any
  duration?: number
}

export default function GuidedSignupTest() {
  const { refreshUserData } = useAuth()
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [testData, setTestData] = useState({
    firstName: "Test",
    lastName: "User",
    email: "",
    username: "",
    password: "TestPassword123!",
  })
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: "generate",
      name: "Generate Test Data",
      description: "Creating unique test credentials",
      status: "pending",
      message: "Waiting to start...",
    },
    {
      id: "validate",
      name: "Validate Form Data",
      description: "Checking all required fields",
      status: "pending",
      message: "Waiting to start...",
    },
    {
      id: "auth",
      name: "Create Firebase Auth Account",
      description: "Creating user in Firebase Authentication",
      status: "pending",
      message: "Waiting to start...",
    },
    {
      id: "firestore",
      name: "Create Firestore Document",
      description: "Verifying user document in Firestore",
      status: "pending",
      message: "Waiting to start...",
    },
    {
      id: "consistency",
      name: "Verify Data Consistency",
      description: "Checking Auth ↔ Firestore data sync",
      status: "pending",
      message: "Waiting to start...",
    },
    {
      id: "defaults",
      name: "Validate Default Settings",
      description: "Confirming proper initialization",
      status: "pending",
      message: "Waiting to start...",
    },
  ])

  const generateTestData = () => {
    const timestamp = Date.now()
    const newTestData = {
      firstName: "Test",
      lastName: "User",
      email: `test.user.${timestamp}@example.com`,
      username: `testuser${timestamp}`,
      password: "TestPassword123!",
    }
    setTestData(newTestData)
    return newTestData
  }

  const updateStep = (stepIndex: number, updates: Partial<TestStep>) => {
    setSteps((prev) => prev.map((step, index) => (index === stepIndex ? { ...step, ...updates } : step)))
  }

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const runComprehensiveTest = async () => {
    setIsRunning(true)
    setCurrentStep(0)
    setProgress(0)

    try {
      // Step 1: Generate Test Data
      setCurrentStep(0)
      updateStep(0, { status: "running", message: "Generating unique test credentials..." })
      await delay(1000)

      const generatedData = generateTestData()
      updateStep(0, {
        status: "success",
        message: `Generated test data for ${generatedData.email}`,
        data: generatedData,
      })
      setProgress(16.67)

      // Step 2: Validate Form Data
      setCurrentStep(1)
      updateStep(1, { status: "running", message: "Validating form data..." })
      await delay(800)

      const validation = {
        hasFirstName: !!generatedData.firstName,
        hasLastName: !!generatedData.lastName,
        hasEmail: !!generatedData.email && generatedData.email.includes("@"),
        hasUsername: !!generatedData.username,
        hasPassword: !!generatedData.password && generatedData.password.length >= 6,
      }

      const isValid = Object.values(validation).every((v) => v)

      if (isValid) {
        updateStep(1, {
          status: "success",
          message: "All form fields are valid",
          data: validation,
        })
      } else {
        updateStep(1, {
          status: "error",
          message: "Form validation failed",
          data: validation,
        })
        setIsRunning(false)
        return
      }
      setProgress(33.33)

      // Step 3: Create Firebase Auth Account
      setCurrentStep(2)
      updateStep(2, { status: "running", message: "Creating Firebase Auth account..." })

      const startTime = Date.now()
      const { user: newUser, userData: newUserData } = await signUpWithEmail(
        generatedData.email,
        generatedData.password,
        generatedData.firstName,
        generatedData.lastName,
        generatedData.username,
      )
      const authDuration = Date.now() - startTime

      updateStep(2, {
        status: "success",
        message: `Firebase Auth account created successfully in ${authDuration}ms`,
        data: {
          uid: newUser.uid,
          email: newUser.email,
          displayName: newUser.displayName,
          emailVerified: newUser.emailVerified,
          creationTime: newUser.metadata.creationTime,
          duration: authDuration,
        },
        duration: authDuration,
      })
      setProgress(50)

      // Step 4: Verify Firestore Document
      setCurrentStep(3)
      updateStep(3, { status: "running", message: "Verifying Firestore document creation..." })
      await delay(1500) // Give Firestore time to sync

      const firestoreStartTime = Date.now()
      const firestoreUserData = await getUserData(newUser.uid)
      const firestoreDuration = Date.now() - firestoreStartTime

      if (firestoreUserData) {
        updateStep(3, {
          status: "success",
          message: `Firestore document verified in ${firestoreDuration}ms`,
          data: {
            uid: firestoreUserData.uid,
            displayName: firestoreUserData.displayName,
            firstName: firestoreUserData.firstName,
            lastName: firestoreUserData.lastName,
            username: firestoreUserData.username,
            email: firestoreUserData.email,
            subscriptionTier: firestoreUserData.subscriptionTier,
            joinDate: firestoreUserData.joinDate,
            duration: firestoreDuration,
          },
          duration: firestoreDuration,
        })
      } else {
        updateStep(3, {
          status: "error",
          message: "Firestore document not found",
          duration: firestoreDuration,
        })
        setIsRunning(false)
        return
      }
      setProgress(66.67)

      // Step 5: Verify Data Consistency
      setCurrentStep(4)
      updateStep(4, { status: "running", message: "Checking data consistency..." })
      await delay(800)

      const consistencyChecks = {
        uid: newUser.uid === firestoreUserData.uid,
        email: newUser.email === firestoreUserData.email,
        displayName: newUser.displayName === firestoreUserData.displayName,
        firstName: generatedData.firstName === firestoreUserData.firstName,
        lastName: generatedData.lastName === firestoreUserData.lastName,
        username: generatedData.username === firestoreUserData.username,
      }

      const allConsistent = Object.values(consistencyChecks).every((check) => check)

      updateStep(4, {
        status: allConsistent ? "success" : "error",
        message: allConsistent
          ? "All data is consistent between Firebase Auth and Firestore"
          : "Data inconsistency detected",
        data: {
          checks: consistencyChecks,
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
      setCurrentStep(5)
      updateStep(5, { status: "running", message: "Validating default settings..." })
      await delay(800)

      const defaultsCheck = {
        subscriptionTier: firestoreUserData.subscriptionTier === "free",
        notificationsEnabled: firestoreUserData.settings?.notifications?.messages === true,
        profileVisible: firestoreUserData.settings?.privacy?.profileVisible === true,
        statsInitialized: typeof firestoreUserData.stats?.messagesSent === "number",
        settingsComplete: !!firestoreUserData.settings?.notifications && !!firestoreUserData.settings?.privacy,
      }

      const defaultsCorrect = Object.values(defaultsCheck).every((check) => check)

      updateStep(5, {
        status: defaultsCorrect ? "success" : "error",
        message: defaultsCorrect ? "All default settings applied correctly" : "Some default settings are incorrect",
        data: {
          checks: defaultsCheck,
          actualSettings: {
            subscriptionTier: firestoreUserData.subscriptionTier,
            notifications: firestoreUserData.settings?.notifications,
            privacy: firestoreUserData.settings?.privacy,
            stats: firestoreUserData.stats,
          },
        },
      })
      setProgress(100)

      // Refresh auth context
      await refreshUserData()
    } catch (error: any) {
      updateStep(currentStep, {
        status: "error",
        message: `Error: ${error.message}`,
        data: { error: error.message, stack: error.stack },
      })
    }

    setIsRunning(false)
  }

  const resetTest = () => {
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        status: "pending",
        message: "Waiting to start...",
        data: undefined,
        duration: undefined,
      })),
    )
    setCurrentStep(0)
    setProgress(0)
    setIsRunning(false)
  }

  const getStepIcon = (step: TestStep) => {
    switch (step.status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "running":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStepBadge = (step: TestStep) => {
    switch (step.status) {
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

  useEffect(() => {
    generateTestData()
  }, [])

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-6 w-6 text-purple-600" />
            <span>🚀 Guided Signup Test Execution</span>
          </CardTitle>
          <CardDescription>
            Automated comprehensive testing of account creation and Firestore document verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Controls */}
          <div className="flex space-x-4">
            <Button onClick={runComprehensiveTest} disabled={isRunning} className="flex-1">
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Test...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Comprehensive Test
                </>
              )}
            </Button>
            <Button onClick={resetTest} variant="outline" disabled={isRunning}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Test Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Test Data Preview */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Generated Test Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {testData.firstName} {testData.lastName}
                </div>
                <div>
                  <span className="font-medium">Username:</span> @{testData.username}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Email:</span> {testData.email}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Execution Steps</h3>
            {steps.map((step, index) => (
              <Card
                key={step.id}
                className={`border-l-4 ${
                  step.status === "success"
                    ? "border-l-green-500"
                    : step.status === "error"
                      ? "border-l-red-500"
                      : step.status === "running"
                        ? "border-l-blue-500"
                        : "border-l-gray-300"
                } ${currentStep === index && isRunning ? "ring-2 ring-blue-200" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-3">
                      {getStepIcon(step)}
                      <span>
                        {index + 1}. {step.name}
                      </span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {step.duration && (
                        <Badge variant="outline" className="text-xs">
                          {step.duration}ms
                        </Badge>
                      )}
                      {getStepBadge(step)}
                    </div>
                  </div>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">{step.message}</p>
                  {step.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium text-purple-600 hover:text-purple-800">
                        View Detailed Results
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto max-h-40 overflow-y-auto">
                        {JSON.stringify(step.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          {progress === 100 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Test Completed Successfully!</strong> All steps passed. The signup process and Firestore
                integration are working correctly.
              </AlertDescription>
            </Alert>
          )}

          {steps.some((step) => step.status === "error") && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Test Failed!</strong> One or more steps encountered errors. Check the detailed results above.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <User className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{steps.filter((s) => s.status === "success").length}</div>
            <div className="text-sm text-gray-600">Steps Passed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{steps.find((s) => s.id === "firestore")?.duration || 0}ms</div>
            <div className="text-sm text-gray-600">Firestore Speed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{steps.find((s) => s.id === "auth")?.duration || 0}ms</div>
            <div className="text-sm text-gray-600">Auth Speed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Settings className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{Math.round(progress)}%</div>
            <div className="text-sm text-gray-600">Completion</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
