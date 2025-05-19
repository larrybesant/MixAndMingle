"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createDjFollowersTable } from "@/app/actions/create-dj-followers-table"
import { createNotification } from "@/app/actions/notifications"
import { useAuth } from "@/context/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function SetupNotificationsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)
  const [testResult, setTestResult] = useState<{ success?: boolean; error?: string } | null>(null)
  const { user } = useAuth()

  const handleSetup = async () => {
    setIsLoading(true)
    setResult(null)
    try {
      const result = await createDjFollowersTable()
      setResult(result)
    } catch (error: any) {
      setResult({ error: error.message || "An error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestNotification = async () => {
    if (!user) return

    setTestResult(null)
    try {
      const result = await createNotification({
        userId: user.id,
        title: "Test Notification",
        content: "This is a test notification to verify the notification system is working correctly.",
        type: "system",
      })
      setTestResult(result)
    } catch (error: any) {
      setTestResult({ error: error.message || "An error occurred" })
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Setup Notifications</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Setup DJ Followers Table</CardTitle>
            <CardDescription>
              Create the necessary database table for DJ followers, which enables notifications when DJs go live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This will create the <code>dj_followers</code> table if it doesn't already exist and set up the
              appropriate row-level security policies.
            </p>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>
                  {result.success
                    ? "DJ followers table has been successfully created."
                    : result.error || "An error occurred while setting up the DJ followers table."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSetup} disabled={isLoading}>
              {isLoading ? "Setting up..." : "Setup DJ Followers Table"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Notification System</CardTitle>
            <CardDescription>
              Send a test notification to yourself to verify the notification system is working correctly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This will send a test notification to your account. Check the notification bell in the navbar to see if it
              appears.
            </p>

            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"} className="mb-4">
                {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>
                  {testResult.success
                    ? "Test notification has been sent. Check the notification bell in the navbar."
                    : testResult.error || "An error occurred while sending the test notification."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleTestNotification} disabled={!user}>
              Send Test Notification
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
