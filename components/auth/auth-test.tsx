"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { signOutUser } from "@/lib/auth"
import { CheckCircle, XCircle, User, Mail, Calendar, Crown, Users } from "lucide-react"

export default function AuthTest() {
  const { user, userData, loading } = useAuth()
  const [testResults, setTestResults] = useState<Array<{ test: string; status: "pass" | "fail"; message: string }>>([])

  const runAuthTests = () => {
    const results = []

    // Test 1: User Authentication State
    if (user) {
      results.push({
        test: "User Authentication",
        status: "pass" as const,
        message: `User is authenticated with UID: ${user.uid}`,
      })
    } else {
      results.push({
        test: "User Authentication",
        status: "fail" as const,
        message: "No user is currently authenticated",
      })
    }

    // Test 2: User Data from Firestore
    if (userData) {
      results.push({
        test: "Firestore User Data",
        status: "pass" as const,
        message: `User data loaded: ${userData.displayName}`,
      })
    } else {
      results.push({
        test: "Firestore User Data",
        status: "fail" as const,
        message: "User data not found in Firestore",
      })
    }

    // Test 3: Email Verification
    if (user?.email) {
      results.push({
        test: "Email Data",
        status: "pass" as const,
        message: `Email: ${user.email}`,
      })
    } else {
      results.push({
        test: "Email Data",
        status: "fail" as const,
        message: "No email found",
      })
    }

    // Test 4: Profile Completeness
    if (userData?.firstName && userData?.lastName) {
      results.push({
        test: "Profile Completeness",
        status: "pass" as const,
        message: "Profile has required fields",
      })
    } else {
      results.push({
        test: "Profile Completeness",
        status: "fail" as const,
        message: "Profile missing required fields",
      })
    }

    // Test 5: Subscription Status
    if (userData?.subscriptionTier) {
      results.push({
        test: "Subscription Status",
        status: "pass" as const,
        message: `Subscription: ${userData.subscriptionTier}`,
      })
    } else {
      results.push({
        test: "Subscription Status",
        status: "fail" as const,
        message: "No subscription data found",
      })
    }

    setTestResults(results)
  }

  const handleLogout = async () => {
    try {
      await signOutUser()
      setTestResults([
        {
          test: "Logout Test",
          status: "pass",
          message: "Successfully logged out",
        },
      ])
    } catch (error: any) {
      setTestResults([
        {
          test: "Logout Test",
          status: "fail",
          message: `Logout failed: ${error.message}`,
        },
      ])
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>🔄 Authentication Test Suite</CardTitle>
          <CardDescription>Loading authentication state...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-purple-600" />
            <span>🧪 Authentication Test Suite</span>
          </CardTitle>
          <CardDescription>Comprehensive testing of Firebase authentication and user data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button onClick={runAuthTests} className="flex-1">
              Run Authentication Tests
            </Button>
            {user && (
              <Button onClick={handleLogout} variant="outline" className="flex-1">
                Test Logout
              </Button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t">
            <h3 className="font-semibold text-lg mb-2">Additional Tests:</h3>
            <div className="flex space-x-4">
              <Button asChild variant="outline" className="flex-1">
                <a href="/test-signup">Detailed Signup Test</a>
              </Button>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Test Results:</h3>
              {testResults.map((result, index) => (
                <Alert key={index} variant={result.status === "pass" ? "default" : "destructive"}>
                  <div className="flex items-center space-x-2">
                    {result.status === "pass" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <strong>{result.test}:</strong> {result.message}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {user && userData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Authentication Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Authentication Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User ID:</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{user.uid.slice(0, 8)}...</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Verified:</span>
                <Badge variant={user.emailVerified ? "default" : "secondary"}>
                  {user.emailVerified ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Provider:</span>
                <Badge variant="outline">{user.providerData[0]?.providerId || "email"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Created:</span>
                <span className="text-sm">{new Date(user.metadata.creationTime!).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Sign In:</span>
                <span className="text-sm">{new Date(user.metadata.lastSignInTime!).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* User Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Profile Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Display Name:</span>
                <span className="text-sm">{userData.displayName || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Username:</span>
                <span className="text-sm">@{userData.username || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{userData.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Subscription:</span>
                <Badge
                  variant={userData.subscriptionTier === "free" ? "secondary" : "default"}
                  className={
                    userData.subscriptionTier === "premium"
                      ? "bg-purple-100 text-purple-800"
                      : userData.subscriptionTier === "vip"
                        ? "bg-yellow-100 text-yellow-800"
                        : ""
                  }
                >
                  {userData.subscriptionTier === "vip" && <Crown className="h-3 w-3 mr-1" />}
                  {userData.subscriptionTier.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Location:</span>
                <span className="text-sm">{userData.location || "Not set"}</span>
              </div>
            </CardContent>
          </Card>

          {/* User Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>User Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{userData.stats?.messagesSent || 0}</div>
                  <div className="text-xs text-gray-600">Messages Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userData.stats?.videoCalls || 0}</div>
                  <div className="text-xs text-gray-600">Video Calls</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userData.stats?.connections || 0}</div>
                  <div className="text-xs text-gray-600">Connections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{userData.stats?.giftsReceived || 0}</div>
                  <div className="text-xs text-gray-600">Gifts Received</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Status */}
          <Card>
            <CardHeader>
              <CardTitle>Settings Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Notifications:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Messages:</span>
                    <Badge
                      variant={userData.settings?.notifications?.messages ? "default" : "secondary"}
                      className="h-4"
                    >
                      {userData.settings?.notifications?.messages ? "On" : "Off"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Video Calls:</span>
                    <Badge
                      variant={userData.settings?.notifications?.videoCalls ? "default" : "secondary"}
                      className="h-4"
                    >
                      {userData.settings?.notifications?.videoCalls ? "On" : "Off"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Privacy:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Profile Visible:</span>
                    <Badge
                      variant={userData.settings?.privacy?.profileVisible ? "default" : "secondary"}
                      className="h-4"
                    >
                      {userData.settings?.privacy?.profileVisible ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Online Status:</span>
                    <Badge variant={userData.settings?.privacy?.onlineStatus ? "default" : "secondary"} className="h-4">
                      {userData.settings?.privacy?.onlineStatus ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!user && (
        <Card>
          <CardHeader>
            <CardTitle>🔐 Authentication Required</CardTitle>
            <CardDescription>Please sign in to test the authentication functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button asChild className="flex-1">
                <a href="/auth/login">Go to Login</a>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <a href="/auth/signup">Go to Signup</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
