"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Search, UserPlus, ShieldCheck, ShieldX, UserX, UserCheck } from "lucide-react"
import type { AdminUser } from "@/types/admin"
import { useToast } from "@/hooks/use-toast"
import UserDetailsDialog from "./user-details-dialog"

export default function UsersList() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(
          (user) =>
            user.email?.toLowerCase().includes(query) ||
            user.displayName?.toLowerCase().includes(query) ||
            user.uid.toLowerCase().includes(query),
        ),
      )
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")
      const data = await response.json()

      if (data.users) {
        setUsers(data.users)
        setFilteredUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleAdminStatus = async (user: AdminUser) => {
    try {
      const isCurrentlyAdmin = !!user.customClaims?.admin

      const response = await fetch("/api/admin/users/update-claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          claims: { admin: !isCurrentlyAdmin },
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setUsers(
          users.map((u) => {
            if (u.uid === user.uid) {
              return {
                ...u,
                customClaims: {
                  ...u.customClaims,
                  admin: !isCurrentlyAdmin,
                },
              }
            }
            return u
          }),
        )

        toast({
          title: "Success",
          description: `Admin status ${!isCurrentlyAdmin ? "granted to" : "revoked from"} ${user.email}`,
        })
      }
    } catch (error) {
      console.error("Error updating admin status:", error)
      toast({
        title: "Error",
        description: "Failed to update admin status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleUserStatus = async (user: AdminUser) => {
    try {
      const response = await fetch("/api/admin/users/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          disabled: !user.disabled,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setUsers(
          users.map((u) => {
            if (u.uid === user.uid) {
              return {
                ...u,
                disabled: !u.disabled,
              }
            }
            return u
          }),
        )

        toast({
          title: "Success",
          description: `User ${!user.disabled ? "disabled" : "enabled"} successfully`,
        })
      }
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewDetails = (user: AdminUser) => {
    setSelectedUser(user)
    setShowUserDetails(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8 w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={user.photoURL || undefined}
                          alt={user.displayName || user.email || user.uid}
                        />
                        <AvatarFallback>
                          {user.displayName
                            ? user.displayName.charAt(0).toUpperCase()
                            : user.email
                              ? user.email.charAt(0).toUpperCase()
                              : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.displayName || "No Name"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.disabled ? "destructive" : "default"}>
                      {user.disabled ? "Disabled" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={user.customClaims?.admin ? "border-blue-500 text-blue-500" : undefined}
                    >
                      {user.customClaims?.admin ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastSignInTime ? new Date(user.lastSignInTime).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell>
                    {user.creationTime ? new Date(user.creationTime).toLocaleDateString() : "Unknown"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(user)}>View Details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleAdminStatus(user)}>
                          {user.customClaims?.admin ? (
                            <>
                              <ShieldX className="mr-2 h-4 w-4" />
                              Remove Admin
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Make Admin
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleUserStatus(user)}>
                          {user.disabled ? (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Enable User
                            </>
                          ) : (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Disable User
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <UserDetailsDialog
          user={selectedUser}
          open={showUserDetails}
          onOpenChange={setShowUserDetails}
          onUserUpdate={(updatedUser) => {
            setUsers(users.map((u) => (u.uid === updatedUser.uid ? updatedUser : u)))
            setSelectedUser(updatedUser)
          }}
        />
      )}
    </div>
  )
}
