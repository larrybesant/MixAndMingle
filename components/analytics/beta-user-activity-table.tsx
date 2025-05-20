"use client"

import { useState, useEffect } from "react"
import type { DateRange } from "react-day-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDownIcon, ArrowUpDownIcon, SearchIcon, UserIcon } from "lucide-react"

interface UserActivity {
  id: string
  name: string
  email: string
  lastActive: Date
  tasksCompleted: number
  feedbackCount: number
  sessionCount: number
  totalTimeSpent: number // in minutes
  role: string
}

interface BetaUserActivityTableProps {
  userRoles: Record<string, string>
  dateRange: DateRange
}

export function BetaUserActivityTable({ userRoles, dateRange }: BetaUserActivityTableProps) {
  const [users, setUsers] = useState<UserActivity[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserActivity[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<keyof UserActivity>("lastActive")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!dateRange.from || !dateRange.to) return

      setIsLoading(true)

      try {
        // In a real implementation, you would fetch this data from Firestore
        // For this example, we'll generate sample data

        const sampleUsers: UserActivity[] = [
          {
            id: "user1",
            name: "Alex Johnson",
            email: "alex@example.com",
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            tasksCompleted: 8,
            feedbackCount: 12,
            sessionCount: 24,
            totalTimeSpent: 320,
            role: userRoles["user1"] || "beta_tester",
          },
          {
            id: "user2",
            name: "Samantha Lee",
            email: "samantha@example.com",
            lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            tasksCompleted: 10,
            feedbackCount: 8,
            sessionCount: 18,
            totalTimeSpent: 245,
            role: userRoles["user2"] || "beta_tester",
          },
          {
            id: "user3",
            name: "Michael Chen",
            email: "michael@example.com",
            lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            tasksCompleted: 6,
            feedbackCount: 5,
            sessionCount: 15,
            totalTimeSpent: 180,
            role: userRoles["user3"] || "beta_tester",
          },
          {
            id: "user4",
            name: "Jessica Williams",
            email: "jessica@example.com",
            lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            tasksCompleted: 9,
            feedbackCount: 15,
            sessionCount: 32,
            totalTimeSpent: 410,
            role: userRoles["user4"] || "beta_tester",
          },
          {
            id: "user5",
            name: "David Kim",
            email: "david@example.com",
            lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            tasksCompleted: 4,
            feedbackCount: 3,
            sessionCount: 10,
            totalTimeSpent: 120,
            role: userRoles["user5"] || "beta_tester",
          },
          {
            id: "user6",
            name: "Emily Rodriguez",
            email: "emily@example.com",
            lastActive: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
            tasksCompleted: 10,
            feedbackCount: 18,
            sessionCount: 28,
            totalTimeSpent: 380,
            role: userRoles["user6"] || "beta_tester",
          },
          {
            id: "user7",
            name: "James Wilson",
            email: "james@example.com",
            lastActive: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            tasksCompleted: 2,
            feedbackCount: 1,
            sessionCount: 5,
            totalTimeSpent: 60,
            role: userRoles["user7"] || "beta_tester",
          },
          {
            id: "user8",
            name: "Olivia Martinez",
            email: "olivia@example.com",
            lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            tasksCompleted: 7,
            feedbackCount: 9,
            sessionCount: 20,
            totalTimeSpent: 260,
            role: userRoles["user8"] || "beta_tester",
          },
        ]

        setUsers(sampleUsers)
        setFilteredUsers(sampleUsers)
      } catch (error) {
        console.error("Error fetching user activity:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserActivity()
  }, [dateRange, userRoles])

  useEffect(() => {
    // Filter users based on search query
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Sort users
    const sorted = [...filtered].sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (fieldA instanceof Date && fieldB instanceof Date) {
        return sortDirection === "asc" ? fieldA.getTime() - fieldB.getTime() : fieldB.getTime() - fieldA.getTime()
      }

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
      }

      if (typeof fieldA === "number" && typeof fieldB === "number") {
        return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA
      }

      return 0
    })

    setFilteredUsers(sorted)
  }, [users, searchQuery, sortField, sortDirection])

  const handleSort = (field: keyof UserActivity) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc") // Default to descending for new sort field
    }
  }

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatLastActive = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return `${diffDays}d ago`
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-2">
              Sort by <ChevronDownIcon className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleSort("lastActive")}>Last Active</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("tasksCompleted")}>Tasks Completed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("feedbackCount")}>Feedback Count</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("sessionCount")}>Session Count</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("totalTimeSpent")}>Time Spent</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort("lastActive")}>
                  Last Active
                  <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort("tasksCompleted")}>
                  Tasks
                  <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort("feedbackCount")}>
                  Feedback
                  <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort("sessionCount")}>
                  Sessions
                  <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort("totalTimeSpent")}>
                  Time Spent
                  <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found matching your search criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="bg-muted rounded-full p-1">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.lastActive.getTime() > Date.now() - 24 * 60 * 60 * 1000 ? "default" : "secondary"}
                    >
                      {formatLastActive(user.lastActive)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.tasksCompleted}/10</TableCell>
                  <TableCell>{user.feedbackCount}</TableCell>
                  <TableCell>{user.sessionCount}</TableCell>
                  <TableCell>{formatTimeSpent(user.totalTimeSpent)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} beta testers
      </div>
    </div>
  )
}
