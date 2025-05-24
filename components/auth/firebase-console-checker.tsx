"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, User, ExternalLink, RefreshCw, Shield, Settings, Eye, Copy } from "lucide-react"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

interface FirebaseUser {
  uid: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  username: string
  subscriptionTier: string
  joinDate: any
  lastActive: any
  stats: any
  settings: any
}

export default function FirebaseConsoleChecker() {
  const { user, userData } = useAuth()
  const [recentUsers, setRecentUsers] = useState<FirebaseUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const firebaseConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  }

  const consoleUrls = {
    authentication: `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`,
    firestore: `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/data`,
    overview: `https://console.firebase.google.com/project/${firebaseConfig.projectId}/overview`,
  }

  const fetchRecentUsers = async () => {
    setIsLoading(true)
    try {
      const usersQuery = query(collection(db, "users"), orderBy("joinDate", "desc"), limit(10))

      const querySnapshot = await getDocs(usersQuery)
      const users = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as FirebaseUser[]

      setRecentUsers(users)
      setLastRefresh(new Date())
    } catch (error) {
      console.error("Error fetching users:", error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchRecentUsers()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleString()
    } catch {
      return "Invalid date"
    }
  }

  const getTimeSince = (timestamp: any) => {
    if (!timestamp) return "N/A"
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins} minutes ago`
      if (diffHours < 24) return `${diffHours} hours ago`
      return `${diffDays} days ago`
    } catch {
      return "N/A"
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <Database className="h-8 w-8 text-purple-600" />
            <span>🔍 Firebase Console Verification</span>
          </CardTitle>
          <CardDescription className="text-lg">
            View and verify users in Firebase Authentication and Firestore Database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-16 flex-col space-y-2">
              <a href={consoleUrls.authentication} target="_blank" rel="noopener noreferrer">
                <Shield className="h-6 w-6" />
                <span>Firebase Authentication</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col space-y-2">
              <a href={consoleUrls.firestore} target="_blank" rel="noopener noreferrer">
                <Database className="h-6 w-6" />
                <span>Firestore Database</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col space-y-2">
              <a href={consoleUrls.overview} target="_blank" rel="noopener noreferrer">
                <Settings className="h-6 w-6" />
                <span>Project Overview</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Firebase Project Configuration</span>
            </span>
            <Badge variant="outline">Active Project</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Project ID:</span>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">{firebaseConfig.projectId}</code>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(firebaseConfig.projectId || "")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Auth Domain:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">{firebaseConfig.authDomain}</code>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Environment:</span>
                <Badge variant="default">Production</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Region:</span>
                <span className="text-gray-600">us-central1</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current User Info */}
      {user && userData && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <span>Currently Authenticated User</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">UID:</span>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-2 py-1 rounded text-xs">{user.uid.slice(0, 12)}...</code>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(user.uid)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span className="text-gray-700">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Display Name:</span>
                  <span className="text-gray-700">{userData.displayName}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Username:</span>
                  <span className="text-gray-700">@{userData.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Subscription:</span>
                  <Badge variant="secondary">{userData.subscriptionTier}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Created:</span>
                  <span className="text-gray-700">{formatDate(userData.joinDate)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Users from Firestore */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Recent Users in Firestore</span>
            </span>
            <div className="flex items-center space-x-2">
              {lastRefresh && (
                <span className="text-sm text-gray-500">Last updated: {lastRefresh.toLocaleTimeString()}</span>
              )}
              <Button size="sm" variant="outline" onClick={fetchRecentUsers} disabled={isLoading}>
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Latest 10 users from the Firestore 'users' collection (ordered by join date)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading recent users...</span>
            </div>
          ) : recentUsers.length === 0 ? (
            <Alert>
              <AlertDescription>
                No users found in Firestore. This might indicate the test users haven't been created yet.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {recentUsers.map((firestoreUser, index) => (
                <Card key={firestoreUser.uid} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">
                          {firestoreUser.firstName} {firestoreUser.lastName}
                        </span>
                        <Badge variant="secondary">@{firestoreUser.username}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={
                            firestoreUser.subscriptionTier === "vip"
                              ? "bg-yellow-100 text-yellow-800"
                              : firestoreUser.subscriptionTier === "premium"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {firestoreUser.subscriptionTier}
                        </Badge>
                        <span className="text-xs text-gray-500">{getTimeSince(firestoreUser.joinDate)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Email:</span>
                        <div className="text-gray-600 break-all">{firestoreUser.email}</div>
                      </div>
                      <div>
                        <span className="font-medium">UID:</span>
                        <div className="flex items-center space-x-1">
                          <code className="text-xs bg-gray-100 px-1 rounded">{firestoreUser.uid.slice(0, 12)}...</code>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(firestoreUser.uid)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Join Date:</span>
                        <div className="text-gray-600">{formatDate(firestoreUser.joinDate)}</div>
                      </div>
                    </div>

                    {firestoreUser.stats && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="font-medium text-sm">Stats:</span>
                        <div className="grid grid-cols-4 gap-2 mt-1 text-xs">
                          <div className="text-center">
                            <div className="font-bold text-purple-600">{firestoreUser.stats.messagesSent || 0}</div>
                            <div className="text-gray-500">Messages</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-blue-600">{firestoreUser.stats.videoCalls || 0}</div>
                            <div className="text-gray-500">Video Calls</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-green-600">{firestoreUser.stats.connections || 0}</div>
                            <div className="text-gray-500">Connections</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-orange-600">{firestoreUser.stats.giftsReceived || 0}</div>
                            <div className="text-gray-500">Gifts</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Console Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>How to View Users in Firebase Console</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="authentication" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="authentication">Firebase Authentication</TabsTrigger>
              <TabsTrigger value="firestore">Firestore Database</TabsTrigger>
            </TabsList>

            <TabsContent value="authentication" className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Firebase Authentication Console</strong> - View user accounts, authentication methods, and
                  security settings
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">
                    1
                  </Badge>
                  <div>
                    <strong>Click the "Firebase Authentication" button above</strong> to open the console
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">
                    2
                  </Badge>
                  <div>
                    Look for users with emails like{" "}
                    <code className="bg-gray-100 px-1 rounded">test.user.{"{timestamp}"}@example.com</code>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">
                    3
                  </Badge>
                  <div>Check the "Created" column to find the most recent test users</div>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">
                    4
                  </Badge>
                  <div>
                    Click on any user to view detailed information including UID, email verification status, and sign-in
                    methods
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="firestore" className="space-y-4">
              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  <strong>Firestore Database Console</strong> - View user documents with complete profile data and
                  settings
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">
                    1
                  </Badge>
                  <div>
                    <strong>Click the "Firestore Database" button above</strong> to open the console
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">
                    2
                  </Badge>
                  <div>
                    Navigate to the <code className="bg-gray-100 px-1 rounded">users</code> collection
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">
                    3
                  </Badge>
                  <div>
                    Look for documents with recent timestamps in the{" "}
                    <code className="bg-gray-100 px-1 rounded">joinDate</code> field
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Badge variant="outline" className="mt-0.5">
                    4
                  </Badge>
                  <div>
                    Click on any document to view the complete user profile including:
                    <ul className="ml-4 mt-1 list-disc">
                      <li>Personal information (firstName, lastName, username)</li>
                      <li>Subscription tier and settings</li>
                      <li>User statistics (messages, video calls, etc.)</li>
                      <li>Privacy and notification preferences</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild variant="outline" className="h-12">
              <a href="/test-live" target="_blank" rel="noreferrer">
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Another Test
              </a>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <a href="/auth/login">
                <User className="h-4 w-4 mr-2" />
                Test Login with Created User
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
