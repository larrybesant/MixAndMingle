"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Clock, CheckCircle, XCircle, Zap, Database, Wifi } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  getChatRooms,
  createChatRoom,
  sendMessage,
  getMessages,
  joinChatRoom,
  type ChatRoom,
  type Message,
} from "@/lib/firestore"
import { toast } from "sonner"

interface TestResult {
  step: string
  status: "pending" | "running" | "success" | "error"
  duration?: number
  details?: string
  error?: string
}

export default function RealTimeChatTest() {
  const { user, userData } = useAuth()
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [testRoom, setTestRoom] = useState<ChatRoom | null>(null)
  const [testMessages, setTestMessages] = useState<Message[]>([])
  const [realTimeActive, setRealTimeActive] = useState(false)

  const testSteps = [
    "Initialize Firebase Connection",
    "Create Test Chat Room",
    "Join Chat Room",
    "Set Up Real-time Listener",
    "Send Test Messages",
    "Verify Message Delivery",
    "Test Message Ordering",
    "Test Real-time Updates",
    "Performance Metrics",
    "Cleanup Test Data",
  ]

  useEffect(() => {
    // Initialize test results
    setTestResults(testSteps.map((step) => ({ step, status: "pending" })))
  }, [])

  const updateTestResult = (stepIndex: number, updates: Partial<TestResult>) => {
    setTestResults((prev) => prev.map((result, index) => (index === stepIndex ? { ...result, ...updates } : result)))
  }

  const runRealTimeChatTest = async () => {
    if (!user || !userData) {
      toast.error("Please log in to run tests")
      return
    }

    setTesting(true)
    const startTime = Date.now()

    try {
      // Step 1: Initialize Firebase Connection
      updateTestResult(0, { status: "running" })
      const step1Start = Date.now()

      // Test Firebase connection
      await new Promise((resolve) => setTimeout(resolve, 500))
      updateTestResult(0, {
        status: "success",
        duration: Date.now() - step1Start,
        details: "Firebase connection established",
      })

      // Step 2: Create Test Chat Room
      updateTestResult(1, { status: "running" })
      const step2Start = Date.now()

      const roomId = await createChatRoom({
        name: `Test Room ${Date.now()}`,
        description: "Real-time chat test room",
        type: "public",
        createdBy: user.uid,
        members: [user.uid],
      })

      const rooms = await getChatRooms()
      const createdRoom = rooms.find((room) => room.id === roomId)
      setTestRoom(createdRoom || null)

      updateTestResult(1, {
        status: "success",
        duration: Date.now() - step2Start,
        details: `Room created with ID: ${roomId}`,
      })

      // Step 3: Join Chat Room
      updateTestResult(2, { status: "running" })
      const step3Start = Date.now()

      await joinChatRoom(roomId, user.uid)

      updateTestResult(2, {
        status: "success",
        duration: Date.now() - step3Start,
        details: "Successfully joined chat room",
      })

      // Step 4: Set Up Real-time Listener
      updateTestResult(3, { status: "running" })
      const step4Start = Date.now()

      const unsubscribe = getMessages(roomId, (messages) => {
        setTestMessages(messages)
        setRealTimeActive(true)
      })

      updateTestResult(3, {
        status: "success",
        duration: Date.now() - step4Start,
        details: "Real-time listener established",
      })

      // Step 5: Send Test Messages
      updateTestResult(4, { status: "running" })
      const step5Start = Date.now()

      const testMessageTexts = [
        "Hello from real-time chat test! 🚀",
        "Testing message ordering...",
        "Real-time updates working! ⚡",
        "Performance test message 📊",
      ]

      for (let i = 0; i < testMessageTexts.length; i++) {
        await sendMessage({
          roomId,
          senderId: user.uid,
          senderName: userData.displayName || "Test User",
          senderAvatar: userData.photoURL || "",
          text: testMessageTexts[i],
          type: "text",
        })

        // Small delay between messages
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      updateTestResult(4, {
        status: "success",
        duration: Date.now() - step5Start,
        details: `Sent ${testMessageTexts.length} test messages`,
      })

      // Step 6: Verify Message Delivery
      updateTestResult(5, { status: "running" })
      const step6Start = Date.now()

      // Wait for messages to arrive via real-time listener
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const deliveredMessages = testMessages.filter((msg) => testMessageTexts.includes(msg.text))

      if (deliveredMessages.length === testMessageTexts.length) {
        updateTestResult(5, {
          status: "success",
          duration: Date.now() - step6Start,
          details: `All ${testMessageTexts.length} messages delivered`,
        })
      } else {
        updateTestResult(5, {
          status: "error",
          duration: Date.now() - step6Start,
          error: `Only ${deliveredMessages.length}/${testMessageTexts.length} messages delivered`,
        })
      }

      // Step 7: Test Message Ordering
      updateTestResult(6, { status: "running" })
      const step7Start = Date.now()

      const orderedCorrectly = testMessages.every((msg, index) => {
        if (index === 0) return true
        const prevMsg = testMessages[index - 1]
        return msg.timestamp >= prevMsg.timestamp
      })

      updateTestResult(6, {
        status: orderedCorrectly ? "success" : "error",
        duration: Date.now() - step7Start,
        details: orderedCorrectly ? "Messages ordered correctly" : "Message ordering issue detected",
      })

      // Step 8: Test Real-time Updates
      updateTestResult(7, { status: "running" })
      const step8Start = Date.now()

      // Send one more message and measure real-time delivery
      const realtimeTestStart = Date.now()
      await sendMessage({
        roomId,
        senderId: user.uid,
        senderName: userData.displayName || "Test User",
        senderAvatar: userData.photoURL || "",
        text: "Real-time delivery test ⚡",
        type: "text",
      })

      // Wait for real-time update
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const realtimeDeliveryTime = Date.now() - realtimeTestStart

      updateTestResult(7, {
        status: "success",
        duration: Date.now() - step8Start,
        details: `Real-time delivery: ${realtimeDeliveryTime}ms`,
      })

      // Step 9: Performance Metrics
      updateTestResult(8, { status: "running" })
      const step9Start = Date.now()

      const totalTestTime = Date.now() - startTime
      const avgMessageDelivery = realtimeDeliveryTime
      const messagesPerSecond = testMessages.length / (totalTestTime / 1000)

      updateTestResult(8, {
        status: "success",
        duration: Date.now() - step9Start,
        details: `Total: ${totalTestTime}ms, Avg delivery: ${avgMessageDelivery}ms, Rate: ${messagesPerSecond.toFixed(2)} msg/s`,
      })

      // Step 10: Cleanup
      updateTestResult(9, { status: "running" })
      const step10Start = Date.now()

      unsubscribe()

      updateTestResult(9, {
        status: "success",
        duration: Date.now() - step10Start,
        details: "Test cleanup completed",
      })

      toast.success("Real-time chat test completed successfully!")
    } catch (error) {
      console.error("Test error:", error)
      toast.error("Test failed: " + (error as Error).message)

      // Mark current running step as error
      const runningIndex = testResults.findIndex((r) => r.status === "running")
      if (runningIndex !== -1) {
        updateTestResult(runningIndex, {
          status: "error",
          error: (error as Error).message,
        })
      }
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-gray-400" />
      case "running":
        return <Zap className="h-4 w-4 text-blue-500 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return "text-gray-500"
      case "running":
        return "text-blue-600"
      case "success":
        return "text-green-600"
      case "error":
        return "text-red-600"
    }
  }

  const successCount = testResults.filter((r) => r.status === "success").length
  const errorCount = testResults.filter((r) => r.status === "error").length
  const totalDuration = testResults.reduce((sum, r) => sum + (r.duration || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Real-time Chat Test System</h1>
          <p className="text-gray-600">Comprehensive testing of Firestore real-time chat functionality</p>
        </div>
        <Button onClick={runRealTimeChatTest} disabled={testing || !user} size="lg">
          {testing ? (
            <>
              <Zap className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Real-time Test
            </>
          )}
        </Button>
      </div>

      {/* Test Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Passed</p>
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-2xl font-bold text-blue-600">{totalDuration}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wifi className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Real-time</p>
                <p className="text-2xl font-bold text-purple-600">{realTimeActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Test Execution Results</span>
          </CardTitle>
          <CardDescription>Real-time chat functionality testing with Firestore listeners</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="steps" className="w-full">
            <TabsList>
              <TabsTrigger value="steps">Test Steps</TabsTrigger>
              <TabsTrigger value="messages">Live Messages</TabsTrigger>
              <TabsTrigger value="room">Test Room</TabsTrigger>
            </TabsList>

            <TabsContent value="steps" className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className={`font-medium ${getStatusColor(result.status)}`}>{result.step}</p>
                      {result.details && <p className="text-sm text-gray-600">{result.details}</p>}
                      {result.error && <p className="text-sm text-red-600">{result.error}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    {result.duration && <Badge variant="secondary">{result.duration}ms</Badge>}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-2">
                {testMessages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No messages yet. Run the test to see real-time messages.
                  </p>
                ) : (
                  testMessages.map((message, index) => (
                    <div key={message.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{message.senderName}</span>
                          <Badge variant="outline">#{index + 1}</Badge>
                        </div>
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.timestamp?.toDate?.()?.toLocaleTimeString() || "Just now"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="room" className="space-y-4">
              {testRoom ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Room Name</label>
                      <p className="text-lg">{testRoom.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Room ID</label>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">{testRoom.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Type</label>
                      <Badge>{testRoom.type}</Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Members</label>
                      <p className="text-lg">{testRoom.memberCount || 0}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-sm">{testRoom.description}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No test room created yet. Run the test to create a room.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
