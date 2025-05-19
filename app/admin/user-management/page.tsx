"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, AlertCircle, Loader2, UserCheck, UserX, RefreshCw } from "lucide-react"

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [searchEmail, setSearchEmail] = useState("")

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers()
      if (error) throw error
      setUsers(data.users)
    } catch (error: any) {
      console.error("Error loading users:", error.message)
      setMessage({
        type: "error",
        text: error.message || "An error occurred while loading users.",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const confirmEmail = async (userId: string) => {
    setActionLoading(true)
    setMessage(null)
    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email_confirm: true,
      })
      if (error) throw error

      await loadUsers()
      setMessage({
        type: "success",
        text: "Email confirmed successfully.",
      })
    } catch (error: any) {
      console.error("Error confirming email:", error.message)
      setMessage({
        type: "error",
        text: error.message || "An error occurred while confirming email.",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const createProfile = async (userId: string, email: string) => {
    setActionLoading(true)
    setMessage(null)
    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError
      }

      if (existingProfile) {
        setMessage({
          type: "success",
          text: "Profile already exists for this user.",
        })
        setActionLoading(false)
        return
      }

      // Create profile
      const nameParts = email.split("@")[0].split(".")
      const firstName = nameParts[0] || "User"
      const lastName = nameParts[1] || ""

      const { error: insertError } = await supabaseAdmin.from("profiles").insert([
        {
          id: userId,
          first_name: firstName,
          last_name: lastName,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (insertError) throw insertError

      setMessage({
        type: "success",
        text: "Profile created successfully.",
      })
    } catch (error: any) {
      console.error("Error creating profile:", error.message)
      setMessage({
        type: "error",
        text: error.message || "An error occurred while creating profile.",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) => !searchEmail || user.email.toLowerCase().includes(searchEmail.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {message && (
        <Alert
          variant={message.type === "error" ? "destructive" : "default"}
          className={`mb-6 ${message.type === "error" ? "bg-red-500/15" : "bg-green-500/15"}`}
        >
          {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertTitle>{message.type === "error" ? "Error" : "Success"}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>Manage user accounts and profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" onClick={loadUsers} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Email Confirmed</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.email_confirmed_at ? (
                            <span className="flex items-center text-green-600">
                              <UserCheck className="h-4 w-4 mr-1" />
                              Yes
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600">
                              <UserX className="h-4 w-4 mr-1" />
                              No
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Never"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {!user.email_confirmed_at && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => confirmEmail(user.id)}
                                disabled={actionLoading}
                              >
                                Confirm Email
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => createProfile(user.id, user.email)}
                              disabled={actionLoading}
                            >
                              Create Profile
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => (window.location.href = `/admin/reset-password?email=${user.email}`)}
                            >
                              Reset Password
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
