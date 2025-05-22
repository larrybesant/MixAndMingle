"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { type AdminUser, DEFAULT_ROLES } from "@/types/admin"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface UserDetailsDialogProps {
  user: AdminUser
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdate: (user: AdminUser) => void
}

export default function UserDetailsDialog({ user, open, onOpenChange, onUserUpdate }: UserDetailsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.customClaims?.roles || [])
  const { toast } = useToast()

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]))
  }

  const saveRoles = async () => {
    try {
      setLoading(true)

      // Calculate permissions based on selected roles
      const permissions = Array.from(
        new Set(DEFAULT_ROLES.filter((role) => selectedRoles.includes(role.id)).flatMap((role) => role.permissions)),
      )

      const response = await fetch("/api/admin/users/update-claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          claims: {
            roles: selectedRoles,
            permissions,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        const updatedUser = {
          ...user,
          customClaims: {
            ...user.customClaims,
            roles: selectedRoles,
            permissions,
          },
        }

        onUserUpdate(updatedUser)

        toast({
          title: "Success",
          description: "User roles updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating user roles:", error)
      toast({
        title: "Error",
        description: "Failed to update user roles. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>View and manage user information</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || user.uid} />
            <AvatarFallback className="text-lg">
              {user.displayName
                ? user.displayName.charAt(0).toUpperCase()
                : user.email
                  ? user.email.charAt(0).toUpperCase()
                  : "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold">{user.displayName || "No Name"}</h3>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant={user.disabled ? "destructive" : "default"}>{user.disabled ? "Disabled" : "Active"}</Badge>
              {user.customClaims?.admin && (
                <Badge variant="outline" className="border-blue-500 text-blue-500">
                  Admin
                </Badge>
              )}
              {user.emailVerified && (
                <Badge variant="outline" className="border-green-500 text-green-500">
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uid">User ID</Label>
                <Input id="uid" value={user.uid} readOnly />
              </div>
              <div>
                <Label htmlFor="created">Created</Label>
                <Input
                  id="created"
                  value={user.creationTime ? new Date(user.creationTime).toLocaleString() : "Unknown"}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="lastSignIn">Last Sign In</Label>
                <Input
                  id="lastSignIn"
                  value={user.lastSignInTime ? new Date(user.lastSignInTime).toLocaleString() : "Never"}
                  readOnly
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch id="emailVerified" checked={user.emailVerified} disabled />
                <Label htmlFor="emailVerified">Email Verified</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEFAULT_ROLES.map((role) => (
                  <Card key={role.id} className={selectedRoles.includes(role.id) ? "border-primary" : ""}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {role.name}
                        <Checkbox
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => handleRoleToggle(role.id)}
                        />
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm text-muted-foreground">
                        <strong>Permissions:</strong> {role.permissions.length}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={saveRoles} disabled={loading}>
                  {loading ? "Saving..." : "Save Roles"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="adminStatus"
                  checked={!!user.customClaims?.admin}
                  onCheckedChange={async (checked) => {
                    try {
                      setLoading(true)

                      const response = await fetch("/api/admin/users/update-claims", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          uid: user.uid,
                          claims: { admin: checked },
                        }),
                      })

                      const data = await response.json()

                      if (data.success) {
                        const updatedUser = {
                          ...user,
                          customClaims: {
                            ...user.customClaims,
                            admin: checked,
                          },
                        }

                        onUserUpdate(updatedUser)

                        toast({
                          title: "Success",
                          description: `Admin status ${checked ? "granted to" : "revoked from"} ${user.email}`,
                        })
                      }
                    } catch (error) {
                      console.error("Error updating admin status:", error)
                      toast({
                        title: "Error",
                        description: "Failed to update admin status. Please try again.",
                        variant: "destructive",
                      })
                    } finally {
                      setLoading(false)
                    }
                  }}
                />
                <Label htmlFor="adminStatus">Admin Status</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="userStatus"
                  checked={!user.disabled}
                  onCheckedChange={async (checked) => {
                    try {
                      setLoading(true)

                      const response = await fetch("/api/admin/users/update-status", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          uid: user.uid,
                          disabled: !checked,
                        }),
                      })

                      const data = await response.json()

                      if (data.success) {
                        const updatedUser = {
                          ...user,
                          disabled: !checked,
                        }

                        onUserUpdate(updatedUser)

                        toast({
                          title: "Success",
                          description: `User ${!checked ? "disabled" : "enabled"} successfully`,
                        })
                      }
                    } catch (error) {
                      console.error("Error updating user status:", error)
                      toast({
                        title: "Error",
                        description: "Failed to update user status. Please try again.",
                        variant: "destructive",
                      })
                    } finally {
                      setLoading(false)
                    }
                  }}
                />
                <Label htmlFor="userStatus">User Active</Label>
              </div>

              <div className="pt-4">
                <Button variant="destructive">Reset Password</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
