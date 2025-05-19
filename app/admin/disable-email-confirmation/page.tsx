"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Info } from "lucide-react"

export default function DisableEmailConfirmationPage() {
  const [adminKey, setAdminKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [authenticated, setAuthenticated] = useState(false)

  const handleDisableEmailConfirmation = async () => {
    setLoading(true)
    setMessage({
      type: "info",
      text: "This is a guide page. To actually disable email confirmation, you need to go to the Supabase dashboard.",
    })
    setLoading(false)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Disable Email Confirmation</h1>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Important Information</AlertTitle>
        <AlertDescription>
          Email confirmation can only be disabled through the Supabase dashboard. This page provides instructions on how
          to do that.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>How to Disable Email Confirmation</CardTitle>
          <CardDescription>Follow these steps in your Supabase dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <p className="font-medium">Log in to your Supabase dashboard</p>
              <p className="text-sm text-muted-foreground">
                Go to{" "}
                <a
                  href="https://app.supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  https://app.supabase.com
                </a>{" "}
                and sign in
              </p>
            </li>
            <li>
              <p className="font-medium">Select your project</p>
              <p className="text-sm text-muted-foreground">Click on the project you're using for MIX & MINGLE</p>
            </li>
            <li>
              <p className="font-medium">Go to Authentication settings</p>
              <p className="text-sm text-muted-foreground">
                In the left sidebar, click on "Authentication" and then "Providers"
              </p>
            </li>
            <li>
              <p className="font-medium">Find Email Provider settings</p>
              <p className="text-sm text-muted-foreground">Look for the "Email" provider in the list</p>
            </li>
            <li>
              <p className="font-medium">Disable "Confirm Email"</p>
              <p className="text-sm text-muted-foreground">
                Turn off the "Confirm email" toggle or set it to "Optional"
              </p>
            </li>
            <li>
              <p className="font-medium">Save changes</p>
              <p className="text-sm text-muted-foreground">Click the "Save" button to apply your changes</p>
            </li>
          </ol>

          <div className="rounded-md bg-gray-100 dark:bg-gray-800 p-4 mt-4">
            <h3 className="font-medium mb-2">Alternative: Use the Supabase Management API</h3>
            <p className="text-sm mb-2">
              You can also use the Supabase Management API to programmatically update these settings. This requires a
              Supabase Management API key.
            </p>
            <pre className="bg-gray-200 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto">
              {`curl -X PATCH 'https://api.supabase.com/v1/projects/{project-ref}/auth/config' \\
  -H 'Authorization: Bearer {supabase-management-api-key}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "MAILER_AUTOCONFIRM": true
  }'`}
            </pre>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleDisableEmailConfirmation} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}I Understand
          </Button>
        </CardFooter>
      </Card>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
          {message.type === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : message.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          <AlertTitle>
            {message.type === "error" ? "Error" : message.type === "success" ? "Success" : "Information"}
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Manual User Verification</CardTitle>
          <CardDescription>If you can't disable email confirmation, you can manually verify users</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            As an alternative to disabling email confirmation, you can manually verify users who have signed up but
            haven't confirmed their email.
          </p>
          <p>
            This is useful for beta testing when you want to quickly onboard users without waiting for them to confirm
            their email.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <a href="/admin/verify-users">Go to User Verification</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
