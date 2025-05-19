"use client"

import { useState, useRef } from "react"
import { createAdminAccount } from "@/app/actions/create-account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Account...
        </>
      ) : (
        "Create Account"
      )}
    </Button>
  )
}

export default function CreateAccountPage() {
  const [result, setResult] = useState<{
    success: boolean
    message: string
    password?: string
  } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleCreateAccount(formData: FormData) {
    const response = await createAdminAccount(formData)
    setResult(response)

    if (response.success && formRef.current) {
      formRef.current.reset()
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create New Account</CardTitle>
          <CardDescription>Create a new account with beta access</CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert
              variant={result.success ? "default" : "destructive"}
              className={`mb-4 ${
                result.success
                  ? "border-green-600 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
                  : "border-red-600 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                {result.message}
                {result.password && (
                  <div className="mt-2">
                    <p className="font-medium">Generated password:</p>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{result.password}</code>
                    <p className="text-sm mt-1">Please save this password as it won't be shown again.</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <form action={handleCreateAccount} ref={formRef} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue="larrybesant@gmail.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" type="text" defaultValue="Larry Besant" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (optional - will be generated if left blank)</Label>
              <Input id="password" name="password" type="password" placeholder="Leave blank to generate a password" />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      {result?.success && (
        <Card className="max-w-md mx-auto mt-6">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">1. Go to the sign-in page</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Navigate to the sign-in page at{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">/signin</code>
              </p>
            </div>
            <div>
              <h3 className="font-medium">2. Sign in with your credentials</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Use your email and {result.password ? "generated" : "chosen"} password to sign in
              </p>
            </div>
            <div>
              <h3 className="font-medium">3. Access beta features</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your account is already configured with beta access
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
