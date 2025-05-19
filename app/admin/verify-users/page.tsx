"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function VerifyUsersPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [adminKey, setAdminKey] = useState("")
  const [authenticated, setAuthenticated] = useState(false)

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", adminKey || "dummy-key")

  const authenticateAdmin = async () => {
    setLoading(true)
    try {
      // Test if the key works by trying to fetch users
      const { data, error } = await supabaseAdmin.auth.admin.listUsers()

      if (error) throw error

      setAuthenticated(true)
      fetchPendingUsers()
    } catch (error: any) {
      setMessage({
        type: "error",
        text: "Invalid admin key or insufficient permissions",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingUsers = async () => {
    if (!authenticated) return

    setLoading(true)
    try {
      // Get users who haven't confirmed their email
      const { data, error } = await supabaseAdmin.auth.admin.listUsers()

      if (error) throw error

      const pending = data.users.filter((user) => !user.email_confirmed_at)
      setPendingUsers(pending)
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to fetch pending users",
      })
    } finally {
      setLoading(false)
    }
  }

  const verifyUser = async (userEmail: string) => {
    setLoading(true)
    try {
      // Get the user by email
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers()

      if (userError) throw userError

      const user = userData.users.find((u) => u.email === userEmail)

      if (!user) {
        throw new Error("User not found")
      }

      // Update user to mark email as confirmed
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email_confirmed_at: new Date().toISOString(),
      })

      if (error) throw error

      setMessage({
        type: "success",
        text: `User ${userEmail} has been verified successfully!`,
      })

      // Refresh the list
      fetchPendingUsers()
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to verify user",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin: Verify Beta Users</h1>

      {!authenticated ? (
        <Card>
          <CardHeader>
            <CardTitle>Admin Authentication</CardTitle>
            <CardDescription>Enter your Supabase service role key to access admin functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminKey">Service Role Key</Label>
                <Input
                  id="adminKey"
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter Supabase service role key"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={authenticateAdmin} disabled={loading || !adminKey}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Authenticate
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Manually Verify User</CardTitle>
              <CardDescription>Enter the email address of the beta tester you want to verify</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => verifyUser(email)} disabled={loading || !email}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify User
              </Button>
            </CardFooter>
          </Card>

          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
              {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertTitle>{message.type === "error" ? "Error" : "Success"}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Pending Users</CardTitle>
              <CardDescription>Users who have signed up but haven't confirmed their email</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <p className="text-muted-foreground">No pending users found</p>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Signed up: {new Date(user.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button onClick={() => verifyUser(user.email)} size="sm">
                        Verify
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={fetchPendingUsers} variant="outline">
                Refresh List
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  )
}
