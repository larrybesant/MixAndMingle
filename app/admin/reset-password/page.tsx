"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("larrybesant@gmail.com")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleResetPassword = async () => {
    setLoading(true)
    setMessage(null)

    try {
      // Create a Supabase client with the service role key
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      )

      // Find the user by email
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers()

      if (userError) throw userError

      const user = userData.users.find((u) => u.email === email)

      if (!user) {
        throw new Error(`User with email ${email} not found`)
      }

      // Update the user's password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password,
      })

      if (updateError) throw updateError

      setMessage({
        type: "success",
        text: `Password for ${email} has been reset successfully. You can now log in with the new password.`,
      })
    } catch (error: any) {
      console.error("Error resetting password:", error.message)
      setMessage({
        type: "error",
        text: error.message || "An error occurred while resetting the password.",
      })
    } finally {
      setLoading(false)
    }
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let result = ""
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(result)
    setShowPassword(true)
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Reset User Password</CardTitle>
          <CardDescription>
            Reset the password for a user account. This will allow them to log in with the new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
              className={message.type === "error" ? "bg-red-500/15" : "bg-green-500/15"}
            >
              {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertTitle>{message.type === "error" ? "Error" : "Success"}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">New Password</Label>
              <Button variant="outline" size="sm" onClick={generatePassword} type="button">
                Generate
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </div>
            {password && (
              <p className="text-xs text-muted-foreground">Make sure to save this password in a secure location.</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleResetPassword} disabled={loading || !email || !password} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </CardFooter>
      </Card>

      {message?.type === "success" && (
        <Card className="max-w-md mx-auto mt-6">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go to the{" "}
                <a href="/signin" className="text-primary hover:underline">
                  Sign In page
                </a>
              </li>
              <li>
                Enter your email: <strong>{email}</strong>
              </li>
              <li>Enter your new password</li>
              <li>Click "Sign In"</li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
