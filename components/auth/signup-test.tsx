"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertCircle, User, Database, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react"
import { signUpWithEmail, getUserData } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

interface TestResult {
  step: string
  status: "pending" | "success" | "error"
  message: string
  data?: any
}

export default function SignupTest() {
  const { user, userData, refreshUserData } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [formData, setFormData] = useState({
    firstName: "Test",
    lastName: "User",
    email: `test.user.${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    password: "TestPassword123!",
    acceptTerms: true,
  })

  const generateRandomTestData = () => {
    const timestamp = Date.now()
    setFormData({
      firstName: "Test",
      lastName: "User",
      email: `test.user.${timestamp}@example.com`,
      username: `testuser${timestamp}`,
      password: "TestPassword123!",
      acceptTerms: true,
    })
  }

  const runSignupTest = async () => {
    setIsLoading(true)
    const results: TestResult[] = []

    // Step 1: Validate form data
    results.push({
      step: "Form Validation",
      status: "pending",
      message: "Validating form data...",
    })
    setTestResults([...results])

    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.username || !formData.password) {
      results[0] = {
        step: "Form Validation",
        status: "error",
        message: "Missing required fields",
      }
      setTestResults([...results])
      setIsLoading(false)
      return
    }

    results[0] = {
      step: "Form Validation",
      status: "success",
      message: "All required fields provided",
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
      },
    }
    setTestResults([...results])

    // Step 2: Create Firebase Auth account
    results.push({
      step: "Firebase Authentication",
      status: "pending",
      message: "Creating Firebase Auth account...",
    })
    setTestResults([...results])

    try {
      const { user: newUser, userData: newUserData } = await signUpWithEmail(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.username,
      )

      results[1] = {
        step: "Firebase Authentication",
        status: "success",
        message: "Firebase Auth account created successfully",
        data: {
          uid: newUser.uid,
          email: newUser.email,
          displayName: newUser.displayName,
          emailVerified: newUser.emailVerified,
          creationTime: newUser.metadata.creationTime,
        },
      }
      setTestResults([...results])

      // Step 3: Verify Firestore document creation
      results.push({
        step: "Firestore Document Creation",
        status: "pending",
        message: "Verifying Firestore user document...",
      })
      setTestResults([...results])

      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Fetch user data from Firestore
      const firestoreUserData = await getUserData(newUser.uid)

      if (firestoreUserData) {
        results[2] = {
          step: "Firestore Document Creation",
          status: "success",
          message: "Firestore user document created and verified",
          data: {
            uid: firestoreUserData.uid,
            displayName: firestoreUserData.displayName,
            firstName: firestoreUserData.firstName,
            lastName: firestoreUserData.lastName,
            username: firestoreUserData.username,
            email: firestoreUserData.email,
            subscriptionTier: firestoreUserData.subscriptionTier,
            joinDate: firestoreUserData.joinDate,
            stats: firestoreUserData.stats,
            settings: firestoreUserData.settings,
          },
        }
      } else {
        results[2] = {
          step: "Firestore Document Creation",
          status: "error",
          message: "Firestore user document not found",
        }
      }
      setTestResults([...results])

      // Step 4: Verify data consistency
      results.push({
        step: "Data Consistency Check",
        status: "pending",
        message: "Checking data consistency between Auth and Firestore...",
      })
      setTestResults([...results])

      await new Promise((resolve) => setTimeout(resolve, 500))

      const consistencyChecks = {
        uid: newUser.uid === firestoreUserData?.uid,
        email: newUser.email === firestoreUserData?.email,
        displayName: newUser.displayName === firestoreUserData?.displayName,
        firstName: formData.firstName === firestoreUserData?.firstName,
        lastName: formData.lastName === firestoreUserData?.lastName,
        username: formData.username === firestoreUserData?.username,
      }

      const allConsistent = Object.values(consistencyChecks).every((check) => check)

      results[3] = {
        step: "Data Consistency Check",
        status: allConsistent ? "success" : "error",
        message: allConsistent
          ? "All data is consistent between Firebase Auth and Firestore"
          : "Data inconsistency detected",
        data: consistencyChecks,
      }
      setTestResults([...results])

      // Step 5: Verify default settings
      results.push({
        step: "Default Settings Verification",
        status: "pending",
        message: "Verifying default user settings...",
      })
      setTestResults([...results])

      await new Promise((resolve) => setTimeout(resolve, 500))

      const expectedDefaults = {
        subscriptionTier: "free",
        notificationsEnabled: true,
        profileVisible: true,
        statsInitialized: true,
      }

      const defaultsCheck = {
        subscriptionTier: firestoreUserData?.subscriptionTier === "free",
        notificationsEnabled: firestoreUserData?.settings?.notifications?.messages === true,
        profileVisible: firestoreUserData?.settings?.privacy?.profileVisible === true,
        statsInitialized: typeof firestoreUserData?.stats?.messagesSent === "number",
      }

      const defaultsCorrect = Object.values(defaultsCheck).every((check) => check)

      results[4] = {
        step: "Default Settings Verification",
        status: defaultsCorrect ? "success" : "error",
        message: defaultsCorrect ? "All default settings applied correctly" : "Some default settings are incorrect",
        data: {
          expected: expectedDefaults,
          actual: {
            subscriptionTier: firestoreUserData?.subscriptionTier,
            notificationsEnabled: firestoreUserData?.settings?.notifications?.messages,
            profileVisible: firestoreUserData?.settings?.privacy?.profileVisible,
            statsInitialized: typeof firestoreUserData?.stats?.messagesSent === "number",
          },
          checks: defaultsCheck,
        },
      }
      setTestResults([...results])

      // Refresh auth context
      await refreshUserData()
    } catch (error: any) {
      results[results.length - 1] = {
        step: results[results.length - 1].step,
        status: "error",
        message: `Error: ${error.message}`,
        data: { error: error.message },
      }
      setTestResults([...results])
    }

    setIsLoading(false)
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Running...</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-6 w-6 text-purple-600" />
            <span>🧪 Signup & Firestore Test Suite</span>
          </CardTitle>
          <CardDescription>
            Test account creation and verify Firestore document creation with detailed validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="form" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="form">Test Form</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
              <TabsTrigger value="verification">Data Verification</TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                />
                <Label htmlFor="terms" className="text-sm">
                  I accept the terms and conditions for testing
                </Label>
              </div>

              <div className="flex space-x-4">
                <Button onClick={runSignupTest} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running Test...
                    </>
                  ) : (
                    "Run Signup Test"
                  )}
                </Button>
                <Button onClick={generateRandomTestData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate New Test Data
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {testResults.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No test results yet. Run the signup test to see detailed results.</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            {getStatusIcon(result.status)}
                            <span>{result.step}</span>
                          </CardTitle>
                          {getStatusBadge(result.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm font-medium text-purple-600">
                              View Details
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="verification" className="space-y-4">
              {user && userData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Firebase Auth Data</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">UID:</span>
                        <code className="text-xs bg-gray-100 px-1 rounded">{user.uid}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span>{user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Display Name:</span>
                        <span>{user.displayName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Email Verified:</span>
                        <Badge variant={user.emailVerified ? "default" : "secondary"}>
                          {user.emailVerified ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Created:</span>
                        <span>{new Date(user.metadata.creationTime!).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Database className="h-5 w-5" />
                        <span>Firestore Data</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">UID:</span>
                        <code className="text-xs bg-gray-100 px-1 rounded">{userData.uid}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">First Name:</span>
                        <span>{userData.firstName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Last Name:</span>
                        <span>{userData.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Username:</span>
                        <span>@{userData.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Subscription:</span>
                        <Badge>{userData.subscriptionTier}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Stats Initialized:</span>
                        <Badge variant={userData.stats ? "default" : "secondary"}>
                          {userData.stats ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No user data available. Please run the signup test first.</AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
