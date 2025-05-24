"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink, Shield, User, Search, Copy, RefreshCw, Clock, Mail, Key } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function FirebaseAuthConsole() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedText, setCopiedText] = useState("")

  const firebaseConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  }

  // Direct Firebase Authentication Console URL
  const authConsoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      setTimeout(() => setCopiedText(""), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  // Sample test user patterns to look for
  const testUserPatterns = ["test.user.*.@example.com", "testuser* (username pattern)", "Test User (display name)"]

  // Recent test credentials that might have been created
  const recentTestEmails = [
    `test.user.${Date.now() - 300000}@example.com`, // 5 minutes ago
    `test.user.${Date.now() - 600000}@example.com`, // 10 minutes ago
    `test.user.${Date.now() - 900000}@example.com`, // 15 minutes ago
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Direct Access Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <Shield className="h-8 w-8 text-blue-600" />
            <span>🔐 Firebase Authentication Console</span>
          </CardTitle>
          <CardDescription className="text-lg">
            Direct access to view all authenticated users in your Firebase project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Direct Console Access */}
            <div className="flex items-center justify-center">
              <Button asChild size="lg" className="h-16 px-8 text-lg">
                <a href={authConsoleUrl} target="_blank" rel="noopener noreferrer">
                  <Shield className="h-6 w-6 mr-3" />🚀 OPEN FIREBASE AUTHENTICATION CONSOLE
                  <ExternalLink className="h-5 w-5 ml-3" />
                </a>
              </Button>
            </div>

            {/* Project Info */}
            <Card className="bg-white/70">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Project ID:</span>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{firebaseConfig.projectId}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(firebaseConfig.projectId || "", "Project ID")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Console URL:</span>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(authConsoleUrl, "Console URL")}>
                      <Copy className="h-3 w-3" />
                      Copy URL
                    </Button>
                  </div>
                </div>
                {copiedText && (
                  <Alert className="mt-2 border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">✅ {copiedText} copied to clipboard!</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Current User Info */}
      {user && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <span>👤 Currently Authenticated User</span>
            </CardTitle>
            <CardDescription>This user should be visible in the Firebase Authentication console</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Email:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{user.email}</span>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(user.email || "", "Email")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">UID:</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-white px-2 py-1 rounded">{user.uid.slice(0, 12)}...</code>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(user.uid, "UID")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Display Name:</span>
                  <span className="text-sm">{user.displayName || "Not set"}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Email Verified:</span>
                  <Badge variant={user.emailVerified ? "default" : "secondary"}>
                    {user.emailVerified ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Provider:</span>
                  <Badge variant="outline">{user.providerData[0]?.providerId || "email"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Created:</span>
                  <span className="text-sm">{new Date(user.metadata.creationTime!).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* What to Look For */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>🔍 What to Look for in the Console</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Test User Patterns */}
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Test User Email Patterns
              </h4>
              <div className="space-y-2">
                {testUserPatterns.map((pattern, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      Pattern {index + 1}
                    </Badge>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{pattern}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Test Emails */}
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Possible Recent Test Emails
              </h4>
              <div className="space-y-2">
                {recentTestEmails.map((email, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <code className="text-sm">{email}</code>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(email, "Test Email")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Helper */}
            <div>
              <h4 className="font-medium mb-3">🔎 Console Search Helper</h4>
              <div className="space-y-2">
                <Label htmlFor="search">Search for users in the console:</Label>
                <div className="flex space-x-2">
                  <Input
                    id="search"
                    placeholder="Enter email or UID to search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(searchTerm, "Search term")}
                    disabled={!searchTerm}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600">
                  Copy this search term and paste it in the Firebase console search box
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Step-by-Step Console Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-1">
                1
              </Badge>
              <div>
                <strong>Click the "OPEN FIREBASE AUTHENTICATION CONSOLE" button above</strong>
                <p className="text-sm text-gray-600 mt-1">This will open the Firebase console in a new tab</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-1">
                2
              </Badge>
              <div>
                <strong>Sign in to Firebase Console (if needed)</strong>
                <p className="text-sm text-gray-600 mt-1">Use your Google account that has access to this project</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-1">
                3
              </Badge>
              <div>
                <strong>Look for the "Users" tab</strong>
                <p className="text-sm text-gray-600 mt-1">
                  You should see a list of all authenticated users in your project
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-1">
                4
              </Badge>
              <div>
                <strong>Sort by "Created" date</strong>
                <p className="text-sm text-gray-600 mt-1">
                  Click the "Created" column header to sort by newest users first
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-1">
                5
              </Badge>
              <div>
                <strong>Look for test users</strong>
                <p className="text-sm text-gray-600 mt-1">
                  Find users with emails like{" "}
                  <code className="bg-gray-100 px-1 rounded">test.user.{"{timestamp}"}@example.com</code>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-1">
                6
              </Badge>
              <div>
                <strong>Click on a user to view details</strong>
                <p className="text-sm text-gray-600 mt-1">
                  See UID, email verification status, sign-in methods, and creation time
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Console Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Firebase Authentication Console Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                User Information
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• User UID (unique identifier)</li>
                <li>• Email address and verification status</li>
                <li>• Display name and photo URL</li>
                <li>• Account creation and last sign-in dates</li>
                <li>• Sign-in methods (email/password, Google, etc.)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Key className="h-4 w-4 mr-2" />
                Available Actions
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• View user details and metadata</li>
                <li>• Disable or delete user accounts</li>
                <li>• Send email verification</li>
                <li>• Reset user passwords</li>
                <li>• Export user data</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-12">
              <a href="/test-live" target="_blank" rel="noreferrer">
                <RefreshCw className="h-4 w-4 mr-2" />
                Create Another Test User
              </a>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <a href="/firebase-console">
                <Search className="h-4 w-4 mr-2" />
                View Firestore Data
              </a>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <a href="/auth/login">
                <User className="h-4 w-4 mr-2" />
                Test Login
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">🔧 Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-yellow-800">Can't see any users?</strong>
              <ul className="mt-1 space-y-1 text-yellow-700">
                <li>• Make sure you're signed in with the correct Google account</li>
                <li>• Verify you have access to the Firebase project</li>
                <li>• Check if you're looking at the correct project ID</li>
                <li>• Try refreshing the console page</li>
              </ul>
            </div>

            <div>
              <strong className="text-yellow-800">Don't see test users?</strong>
              <ul className="mt-1 space-y-1 text-yellow-700">
                <li>• Run the live test again to create new users</li>
                <li>• Check if the test completed successfully</li>
                <li>• Look for users created in the last few minutes</li>
                <li>• Search using the email patterns shown above</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
