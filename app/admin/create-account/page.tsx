"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function CreateAccountPage() {
  const [email, setEmail] = useState("larrybesant@gmail.com")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("Larry Besant")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    password?: string
  } | null>(null)

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      // Create a Supabase client with admin privileges
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      // Generate a random password if none provided
      const finalPassword =
        password || Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4)

      // Create the user with email confirmation disabled
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password: finalPassword,
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
          full_name: name,
          is_beta_tester: true,
        },
      })

      if (userError) throw userError

      if (userData.user) {
        // Create a profile for the user
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: userData.user.id,
            full_name: name,
            email: email,
            is_beta_tester: true,
            beta_joined_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        if (profileError) throw profileError

        setResult({
          success: true,
          message: "Account created successfully!",
          password: password ? undefined : finalPassword,
        })
      }
    } catch (error: any) {
      console.error("Error creating account:", error)
      setResult({
        success: false,
        message: error.message || "An error occurred while creating the account.",
      })
    } finally {
      setIsLoading(false)
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

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (optional - will be generated if left blank)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to generate a password"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateAccount} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </CardFooter>
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
                Use your email and {password ? "chosen" : "generated"} password to sign in
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
