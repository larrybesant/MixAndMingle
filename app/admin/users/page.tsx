import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, Search } from "lucide-react"

// Mock data for users
const users = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "/abstract-geometric-shapes.png",
    status: "active",
    role: "user",
    lastActive: "2023-05-20T10:30:00Z",
    joinedAt: "2023-01-15T08:30:00Z",
  },
  {
    id: "2",
    name: "Samantha Lee",
    email: "samantha@example.com",
    avatar: "/number-two-graphic.png",
    status: "active",
    role: "admin",
    lastActive: "2023-05-20T09:45:00Z",
    joinedAt: "2023-02-10T14:15:00Z",
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "michael@example.com",
    avatar: "/abstract-geometric-shapes.png",
    status: "pending",
    role: "user",
    lastActive: "2023-05-18T16:20:00Z",
    joinedAt: "2023-03-05T11:30:00Z",
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    email: "emily@example.com",
    avatar: "/abstract-geometric-shapes.png",
    status: "active",
    role: "moderator",
    lastActive: "2023-05-20T08:15:00Z",
    joinedAt: "2023-01-20T09:45:00Z",
  },
  {
    id: "5",
    name: "David Kim",
    email: "david@example.com",
    avatar: "/abstract-geometric-composition-5.png",
    status: "inactive",
    role: "user",
    lastActive: "2023-05-10T14:30:00Z",
    joinedAt: "2023-02-28T16:20:00Z",
  },
  {
    id: "6",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "/abstract-geometric-shapes.png",
    status: "active",
    role: "user",
    lastActive: "2023-05-19T11:45:00Z",
    joinedAt: "2023-03-15T10:30:00Z",
  },
  {
    id: "7",
    name: "James Wilson",
    email: "james@example.com",
    avatar: "/abstract-geometric-seven.png",
    status: "active",
    role: "user",
    lastActive: "2023-05-20T13:10:00Z",
    joinedAt: "2023-04-05T08:45:00Z",
  },
  {
    id: "8",
    name: "Lisa Brown",
    email: "lisa@example.com",
    avatar: "/abstract-geometric-sculpture.png",
    status: "suspended",
    role: "user",
    lastActive: "2023-05-15T09:30:00Z",
    joinedAt: "2023-02-12T14:20:00Z",
  },
]

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all users in your application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search users..." className="pl-8 w-[300px]" />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Status</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>All</DropdownMenuItem>
                  <DropdownMenuItem>Active</DropdownMenuItem>
                  <DropdownMenuItem>Pending</DropdownMenuItem>
                  <DropdownMenuItem>Inactive</DropdownMenuItem>
                  <DropdownMenuItem>Suspended</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Role</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>All</DropdownMenuItem>
                  <DropdownMenuItem>Admin</DropdownMenuItem>
                  <DropdownMenuItem>Moderator</DropdownMenuItem>
                  <DropdownMenuItem>User</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "active"
                            ? "default"
                            : user.status === "pending"
                              ? "outline"
                              : user.status === "suspended"
                                ? "destructive"
                                : "secondary"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.role === "admin"
                            ? "border-blue-500 text-blue-500"
                            : user.role === "moderator"
                              ? "border-green-500 text-green-500"
                              : undefined
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.lastActive).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(user.joinedAt).toLocaleDateString()}</TableCell>
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
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit User</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Reset Password</DropdownMenuItem>
                          {user.status === "active" ? (
                            <DropdownMenuItem className="text-amber-600">Suspend User</DropdownMenuItem>
                          ) : user.status === "suspended" ? (
                            <DropdownMenuItem className="text-green-600">Reactivate User</DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
