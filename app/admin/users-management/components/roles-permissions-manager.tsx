"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES, type UserPermission, type UserRole } from "@/types/admin"
import { PlusCircle } from "lucide-react"

export default function RolesPermissionsManager() {
  const [roles, setRoles] = useState<UserRole[]>(DEFAULT_ROLES)
  const [permissions, setPermissions] = useState<UserPermission[]>(DEFAULT_PERMISSIONS)
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDescription, setNewRoleDescription] = useState("")

  const handlePermissionToggle = (roleId: string, permissionId: string) => {
    setRoles(
      roles.map((role) => {
        if (role.id === roleId) {
          return {
            ...role,
            permissions: role.permissions.includes(permissionId)
              ? role.permissions.filter((id) => id !== permissionId)
              : [...role.permissions, permissionId],
          }
        }
        return role
      }),
    )
  }

  const handleAddRole = () => {
    if (!newRoleName.trim()) return

    const newRoleId = newRoleName.toLowerCase().replace(/\s+/g, "-")

    if (roles.some((role) => role.id === newRoleId)) {
      alert("A role with this name already exists")
      return
    }

    setRoles([
      ...roles,
      {
        id: newRoleId,
        name: newRoleName,
        description: newRoleDescription || `${newRoleName} role`,
        permissions: [],
      },
    ])

    setNewRoleName("")
    setNewRoleDescription("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>Configure which permissions are assigned to each role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Permission</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.id} className="text-center">
                      {role.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-muted-foreground">{permission.description}</div>
                      </div>
                    </TableCell>
                    {roles.map((role) => (
                      <TableCell key={role.id} className="text-center">
                        <Checkbox
                          checked={role.permissions.includes(permission.id)}
                          onCheckedChange={() => handlePermissionToggle(role.id, permission.id)}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Role</CardTitle>
          <CardDescription>Create a new role with custom permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="roleName" className="block text-sm font-medium mb-1">
                  Role Name
                </label>
                <Input
                  id="roleName"
                  placeholder="e.g., Content Editor"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="roleDescription" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Input
                  id="roleDescription"
                  placeholder="e.g., Can edit content but not publish"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleAddRole}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </CardFooter>
      </Card>

      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  )
}
