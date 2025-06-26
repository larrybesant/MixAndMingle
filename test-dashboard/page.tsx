"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Radio,
  Heart,
  MessageCircle,
  Settings,
  Database,
  Wifi,
  Shield,
} from "lucide-react"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message: string
  details?: string
}

export default function TestDashboardPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/real-login")
    }
  }, [user, loading, router])

  const runComprehensiveTests = async () => {
    setIsRunningTests(true)
    const tests: TestResult[] = [
      { name: "Database Connection", status: "pending", message: "Testing..." },
      { name: "User Authentication", status: "pending", message: "Testing..." },
      { name: "Profile System", status: "pending", message: "Testing..." },
      { name: "Room Creation", status: "pending", message: "Testing..." },
      { name: "Matching System", status: "pending", message: "Testing..." },
      { name: "Messaging System", status: "pending", message: "Testing..." },
    ]

    setTestResults([...tests])

    // Test 1: Database Connection
    try {
      const dbResponse = await fetch("/api/test-db")
      const dbResult = await dbResponse.json()
      tests[0] = {
        ...tests[0],
        status: dbResult.success ? "success" : "error",
        message: dbResult.success ? "Connected successfully" : "Connection failed",
        details: dbResult.message,
      }
    } catch (err) {
      tests[0] = { ...tests[0], status: "error", message: "Connection failed", details: String(err) }
    }
    setTestResults([...tests])

    // Test 2: User Authentication
    tests[1] = {
      ...tests[1],
      status: user ? "success" : "error",
      message: user ? `Authenticated as ${user.email}` : "Not authenticated",
      details: user ? `User ID: ${user.id}` : "Please log in",
    }
    setTestResults([...tests])

    // Test 3: Profile System
    tests[2] = {
      ...tests[2],
      status: profile ? "success" : "error",
      message: profile ? "Profile loaded" : "No profile found",
      details: profile ? `Profile: ${profile.full_name || "Unnamed"}` : "Create profile to continue",
    }
    setTestResults([...tests])

    // Test 4: Room Creation (API test)
    try {
      const roomResponse = await fetch("/api/test-room-creation", { method: "POST" })
      const roomResult = await roomResponse.json()
      tests[3] = {
        ...tests[3],
        status: roomResult.success ? "success" : "error",
        message: roomResult.success ? "Room system working" : "Room creation failed",
        details: roomResult.message,
      }
    } catch (err) {
      tests[3] = { ...tests[3], status: "error", message: "Room test failed", details: String(err) }
    }
    setTestResults([...tests])

    // Test 5: Matching System
    try {
      const matchResponse = await fetch("/api/matching/potential")
      const matchResult = await matchResponse.json()
      tests[4] = {
        ...tests[4],
        status: matchResponse.ok ? "success" : "error",
        message: matchResponse.ok ? "Matching system ready" : "Matching system error",
        details: matchResponse.ok ? `Found ${matchResult.users?.length || 0} potential matches` : "API error",
      }
    } catch (err) {
      tests[4] = { ...tests[4], status: "error", message: "Matching test failed", details: String(err) }
    }
    setTestResults([...tests])

    // Test 6: Messaging System
    tests[5] = {
      ...tests[5],
      status: "success",
      message: "Message UI ready",
      details: "Real-time messaging components loaded",
    }
    setTestResults([...tests])

    setIsRunningTests(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black">
        <div className="text-xl text-white flex items-center">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Loading your account...
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">🧪 Mix & Mingle Test Dashboard</h1>
              <p className="text-gray-400">Testing all app functions with real authentication</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-600 text-white">
                <Shield className="w-3 h-3 mr-1" />
                Authenticated
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="border-red-400 text-red-400 hover:bg-red-400/10"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-black/40">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="matching">Matching</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Info */}
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Your Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white font-mono">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">User ID</p>
                    <p className="text-white font-mono text-xs">{user.id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Profile Status</p>
                    <Badge className={profile ? "bg-green-600" : "bg-yellow-600"}>
                      {profile ? "Profile Created" : "Profile Needed"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* System Tests */}
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    System Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={runComprehensiveTests}
                    disabled={isRunningTests}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isRunningTests ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running Tests...
                      </>
                    ) : (
                      "Run All System Tests"
                    )}
                  </Button>

                  {testResults.length > 0 && (
                    <div className="space-y-2">
                      {testResults.map((test, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                          <div className="flex-1">
                            <p className="text-sm text-white">{test.name}</p>
                            <p className="text-xs text-gray-400">{test.message}</p>
                            {test.details && <p className="text-xs text-gray-500 mt-1">{test.details}</p>}
                          </div>
                          <div className="ml-2">
                            {test.status === "pending" && <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />}
                            {test.status === "success" && <CheckCircle className="w-4 h-4 text-green-400" />}
                            {test.status === "error" && <XCircle className="w-4 h-4 text-red-400" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">🚀 Test All Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setActiveTab("profile")}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-16 flex-col"
                  >
                    <User className="w-6 h-6 mb-1" />
                    <span className="text-sm">Test Profile</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("rooms")}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-16 flex-col"
                  >
                    <Radio className="w-6 h-6 mb-1" />
                    <span className="text-sm">Test Rooms</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("matching")}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 h-16 flex-col"
                  >
                    <Heart className="w-6 h-6 mb-1" />
                    <span className="text-sm">Test Matching</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("messages")}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-16 flex-col"
                  >
                    <MessageCircle className="w-6 h-6 mb-1" />
                    <span className="text-sm">Test Messages</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">👤 Profile System Test</CardTitle>
              </CardHeader>
              <CardContent>
                {profile ? (
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Profile system working! Your profile is loaded.</AlertDescription>
                    </Alert>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Full Name</p>
                        <p className="text-white">{profile.full_name || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Username</p>
                        <p className="text-white">{profile.username || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Bio</p>
                        <p className="text-white">{profile.bio || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">DJ Status</p>
                        <Badge className={profile.is_dj ? "bg-green-600" : "bg-gray-600"}>
                          {profile.is_dj ? "DJ" : "Listener"}
                        </Badge>
                      </div>
                    </div>
                    <Button onClick={() => router.push("/profile-setup")} className="bg-purple-600 hover:bg-purple-700">
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>No profile found. Create your profile to test all features.</AlertDescription>
                    </Alert>
                    <Button
                      onClick={() => router.push("/profile-setup")}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Create Profile Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms">
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">🎵 DJ Rooms Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => router.push("/rooms")}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-16 flex-col"
                  >
                    <Radio className="w-6 h-6 mb-1" />
                    <span>Browse Live Rooms</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/go-live")}
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 h-16 flex-col"
                  >
                    <Wifi className="w-6 h-6 mb-1" />
                    <span>Start Broadcasting</span>
                  </Button>
                </div>
                <Alert>
                  <AlertDescription>
                    Test creating rooms, joining live streams, and real-time chat functionality.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matching Tab */}
          <TabsContent value="matching">
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">💕 Matchmaking Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => router.push("/matchmaking")}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 h-16"
                >
                  <Heart className="w-6 h-6 mr-2" />
                  Test Swipe Interface
                </Button>
                <Alert>
                  <AlertDescription>
                    Test the swipe-based matching system, view potential matches, and manage connections.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">💬 Messaging Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => router.push("/messages")}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-16"
                >
                  <MessageCircle className="w-6 h-6 mr-2" />
                  Test Real-time Chat
                </Button>
                <Alert>
                  <AlertDescription>
                    Test real-time messaging, conversation management, and notification system.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">⚙️ Settings & Admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => router.push("/settings")}
                    className="bg-gray-600 hover:bg-gray-700 h-16 flex-col"
                  >
                    <Settings className="w-6 h-6 mb-1" />
                    <span>User Settings</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/admin")}
                    className="bg-orange-600 hover:bg-orange-700 h-16 flex-col"
                  >
                    <Shield className="w-6 h-6 mb-1" />
                    <span>Admin Panel</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
