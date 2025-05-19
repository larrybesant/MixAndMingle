"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Search, Trash, UserX, Shield, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/utils/supabase-client"
import { isAuthorized } from "@/utils/auth-utils"

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw new Error("Failed to get session")
        }

        if (!session) {
          // Redirect to login if not authenticated
          router.push("/login?redirect=/dashboard/admin")
          return
        }

        // Check if user is an admin
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          throw new Error("Failed to get user profile")
        }

        const userIsAdmin = profile?.role === "admin"
        setIsAdmin(userIsAdmin)

        if (!userIsAdmin) {
          // Redirect to dashboard if not an admin
          router.push("/dashboard")
          return
        }

        // Fetch users and reports
        await Promise.all([fetchUsers(), fetchReports()])
      } catch (error) {
        console.error("Error checking admin status:", error)
        setError("Failed to load admin page. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

        if (error) {
          throw new Error("Failed to fetch users")
        }

        setUsers(data || [])
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        })
      }
    }

    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select(`
            *,
            reported_user:reported_user_id(id, first_name, last_name, username, avatar_url),
            reporter:reporter_id(id, first_name, last_name, username, avatar_url)
          `)
          .order("created_at", { ascending: false })

        if (error) {
          throw new Error("Failed to fetch reports")
        }

        setReports(data || [])
      } catch (error) {
        console.error("Error fetching reports:", error)
        toast({
          title: "Error",
          description: "Failed to fetch reports",
          variant: "destructive",
        })
      }
    }

    checkAdminStatus()
  }, [router, toast])

  const handleBanUser = async (userId: string) => {
    try {
      // Check if user is authorized
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("Not authenticated")
      }

      const isAuth = await isAuthorized(session.user.id, "profile", userId, "update")

      if (!isAuth) {
        throw new Error("Not authorized to ban users")
      }

      // Update user profile
      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: true,
          ban_reason: "Violation of community guidelines",
          banned_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        throw new Error("Failed to ban user")
      }

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, is_banned: true } : user)))

      toast({
        title: "User banned",
        description: "The user has been banned from the platform.",
      })

      setDialogOpen(false)
    } catch (error) {
      console.error("Error banning user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to ban user",
        variant: "destructive",
      })
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      // Check if user is authorized
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("Not authenticated")
      }

      const isAuth = await isAuthorized(session.user.id, "profile", userId, "update")

      if (!isAuth) {
        throw new Error("Not authorized to unban users")
      }

      // Update user profile
      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: false,
          ban_reason: null,
          banned_at: null,
        })
        .eq("id", userId)

      if (error) {
        throw new Error("Failed to unban user")
      }

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, is_banned: false } : user)))

      toast({
        title: "User unbanned",
        description: "The user has been unbanned.",
      })
    } catch (error) {
      console.error("Error unbanning user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unban user",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    try {
      // Check if user is authorized
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("Not authenticated")
      }

      const isAuth = await isAuthorized(session.user.id, "report", reportId, "delete")

      if (!isAuth) {
        throw new Error("Not authorized to delete reports")
      }

      // Delete the report
      const { error } = await supabase.from("reports").delete().eq("id", reportId)

      if (error) {
        throw new Error("Failed to delete report")
      }

      // Update local state
      setReports(reports.filter((report) => report.id !== reportId))

      toast({
        title: "Report deleted",
        description: "The report has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting report:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete report",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.refresh()}>Retry</Button>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage users and reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((user) => !user.is_banned).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((user) => user.is_banned).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                          <div className="text-xs text-muted-foreground">@{user.username || "No username"}</div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.is_banned ? (
                            <Badge variant="destructive">Banned</Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.is_banned ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnbanUser(user.id)}
                              className="ml-2"
                            >
                              Unban
                            </Button>
                          ) : (
                            <Dialog
                              open={dialogOpen && selectedUser?.id === user.id}
                              onOpenChange={(open) => {
                                setDialogOpen(open)
                                if (!open) setSelectedUser(null)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}>
                                  <UserX className="h-4 w-4" />
                                  <span className="sr-only">Ban User</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Ban User</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to ban this user? This action can be undone later.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <p>
                                    <strong>Name:</strong> {selectedUser?.first_name} {selectedUser?.last_name}
                                  </p>
                                  <p>
                                    <strong>Username:</strong> @{selectedUser?.username || "No username"}
                                  </p>
                                  <p>
                                    <strong>Email:</strong> {selectedUser?.email}
                                  </p>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button variant="destructive" onClick={() => handleBanUser(selectedUser?.id)}>
                                    Ban User
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reported User</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length > 0 ? (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          {report.reported_user?.first_name} {report.reported_user?.last_name}
                          <div className="text-xs text-muted-foreground">
                            @{report.reported_user?.username || "Unknown"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.reporter?.first_name} {report.reporter?.last_name}
                          <div className="text-xs text-muted-foreground">@{report.reporter?.username || "Unknown"}</div>
                        </TableCell>
                        <TableCell>{report.reason}</TableCell>
                        <TableCell>
                          {report.created_at ? new Date(report.created_at).toLocaleDateString() : "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteReport(report.id)}>
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete Report</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(report.reported_user)
                              setDialogOpen(true)
                            }}
                          >
                            <Shield className="h-4 w-4" />
                            <span className="sr-only">Ban User</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No reports found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
