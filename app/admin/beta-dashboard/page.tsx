import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  AlertCircle,
  ArrowUpDown,
  Bug,
  CheckCircle,
  Clock,
  Filter,
  Lightbulb,
  MoreHorizontal,
  Search,
  ThumbsUp,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for the dashboard
const bugReports = [
  {
    id: "BUG-001",
    title: "Stream freezes when changing quality settings",
    status: "open",
    severity: "high",
    reporter: "john.doe@example.com",
    assignee: "dev.team",
    created: "2023-05-14T10:30:00Z",
    updated: "2023-05-14T14:45:00Z",
    category: "streaming",
    votes: 7,
  },
  {
    id: "BUG-002",
    title: "Chat messages not appearing in real-time",
    status: "in-progress",
    severity: "medium",
    reporter: "jane.smith@example.com",
    assignee: "alex.dev",
    created: "2023-05-13T08:20:00Z",
    updated: "2023-05-15T09:15:00Z",
    category: "chat",
    votes: 5,
  },
  {
    id: "BUG-003",
    title: "Mobile layout breaks on small screens",
    status: "open",
    severity: "low",
    reporter: "mobile.user@example.com",
    assignee: "unassigned",
    created: "2023-05-12T16:40:00Z",
    updated: "2023-05-12T16:40:00Z",
    category: "ui",
    votes: 3,
  },
  {
    id: "BUG-004",
    title: "Song request feature returns 404 error",
    status: "fixed",
    severity: "high",
    reporter: "dj.master@example.com",
    assignee: "sarah.dev",
    created: "2023-05-10T11:25:00Z",
    updated: "2023-05-15T13:10:00Z",
    category: "features",
    votes: 8,
  },
  {
    id: "BUG-005",
    title: "Profile images not uploading correctly",
    status: "in-progress",
    severity: "medium",
    reporter: "user123@example.com",
    assignee: "mike.dev",
    created: "2023-05-11T09:50:00Z",
    updated: "2023-05-14T11:30:00Z",
    category: "profiles",
    votes: 4,
  },
]

const featureRequests = [
  {
    id: "FEAT-001",
    title: "Add dark mode toggle for light theme option",
    status: "planned",
    priority: "medium",
    reporter: "night.owl@example.com",
    created: "2023-05-13T14:20:00Z",
    updated: "2023-05-15T10:45:00Z",
    category: "ui",
    votes: 12,
  },
  {
    id: "FEAT-002",
    title: "Allow DJs to schedule recurring streams",
    status: "under-review",
    priority: "high",
    reporter: "weekly.dj@example.com",
    created: "2023-05-12T08:30:00Z",
    updated: "2023-05-14T16:20:00Z",
    category: "streaming",
    votes: 18,
  },
  {
    id: "FEAT-003",
    title: "Implement tipping system for DJs",
    status: "planned",
    priority: "high",
    reporter: "supporter@example.com",
    created: "2023-05-10T09:15:00Z",
    updated: "2023-05-15T11:30:00Z",
    category: "monetization",
    votes: 24,
  },
  {
    id: "FEAT-004",
    title: "Add playlist sharing between users",
    status: "under-review",
    priority: "medium",
    reporter: "music.lover@example.com",
    created: "2023-05-11T15:40:00Z",
    updated: "2023-05-13T09:25:00Z",
    category: "social",
    votes: 9,
  },
  {
    id: "FEAT-005",
    title: "Create mobile app version",
    status: "planned",
    priority: "high",
    reporter: "mobile.fan@example.com",
    created: "2023-05-09T10:10:00Z",
    updated: "2023-05-15T14:50:00Z",
    category: "platform",
    votes: 31,
  },
]

const generalFeedback = [
  {
    id: "FEED-001",
    title: "Love the streaming quality!",
    type: "positive",
    reporter: "happy.user@example.com",
    created: "2023-05-14T11:20:00Z",
    category: "streaming",
    votes: 5,
  },
  {
    id: "FEED-002",
    title: "UI is intuitive and easy to navigate",
    type: "positive",
    reporter: "ux.fan@example.com",
    created: "2023-05-13T09:45:00Z",
    category: "ui",
    votes: 7,
  },
  {
    id: "FEED-003",
    title: "Onboarding process could be clearer",
    type: "suggestion",
    reporter: "new.user@example.com",
    created: "2023-05-12T14:30:00Z",
    category: "onboarding",
    votes: 4,
  },
  {
    id: "FEED-004",
    title: "Would like more genre filters for streams",
    type: "suggestion",
    reporter: "genre.lover@example.com",
    created: "2023-05-11T16:15:00Z",
    category: "discovery",
    votes: 8,
  },
]

// Helper function to format dates
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default function BetaDashboardPage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Beta Feedback Dashboard</h1>
          <p className="text-gray-400">Track and manage feedback from beta testers</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/feedback">Submit Feedback</Link>
          </Button>
          <Button asChild>
            <Link href="/feature-voting">Feature Voting</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle>Overview</CardTitle>
            <CardDescription>Summary of beta feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-400">Bug Reports</h3>
                  <Bug className="h-4 w-4 text-red-500" />
                </div>
                <p className="text-2xl font-bold mt-2">{bugReports.length}</p>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-red-500 font-medium">
                    {bugReports.filter((b) => b.status === "open").length} open
                  </span>{" "}
                  · {bugReports.filter((b) => b.status === "in-progress").length} in progress ·{" "}
                  {bugReports.filter((b) => b.status === "fixed").length} fixed
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-400">Feature Requests</h3>
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold mt-2">{featureRequests.length}</p>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-blue-500 font-medium">
                    {featureRequests.filter((f) => f.status === "planned").length} planned
                  </span>{" "}
                  · {featureRequests.filter((f) => f.status === "under-review").length} under review
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-400">General Feedback</h3>
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold mt-2">{generalFeedback.length}</p>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-green-500 font-medium">
                    {generalFeedback.filter((f) => f.type === "positive").length} positive
                  </span>{" "}
                  · {generalFeedback.filter((f) => f.type === "suggestion").length} suggestions
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-400">Total Votes</h3>
                  <ThumbsUp className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-2xl font-bold mt-2">
                  {bugReports.reduce((sum, bug) => sum + bug.votes, 0) +
                    featureRequests.reduce((sum, feat) => sum + feat.votes, 0) +
                    generalFeedback.reduce((sum, feed) => sum + feed.votes, 0)}
                </p>
                <div className="mt-2 text-xs text-gray-500">Across all feedback items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bugs" className="w-full">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="bugs" className="data-[state=active]:bg-gray-700">
              <Bug className="h-4 w-4 mr-2" />
              Bug Reports
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-gray-700">
              <Lightbulb className="h-4 w-4 mr-2" />
              Feature Requests
            </TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:bg-gray-700">
              <ThumbsUp className="h-4 w-4 mr-2" />
              General Feedback
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 bg-gray-800 border-gray-700 w-[200px] md:w-[300px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem className="focus:bg-gray-800">
                  <Select>
                    <SelectTrigger className="w-full border-0 p-0 h-auto focus:ring-0">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-gray-800">
                  <Select>
                    <SelectTrigger className="w-full border-0 p-0 h-auto focus:ring-0">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="streaming">Streaming</SelectItem>
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="ui">UI/UX</SelectItem>
                      <SelectItem value="profiles">Profiles</SelectItem>
                    </SelectContent>
                  </Select>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-gray-800">
                  <Select>
                    <SelectTrigger className="w-full border-0 p-0 h-auto focus:ring-0">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="bugs" className="mt-0">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-800">
                  <TableRow className="hover:bg-gray-800/50 border-gray-800">
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px]">Severity</TableHead>
                    <TableHead className="w-[120px]">Category</TableHead>
                    <TableHead className="w-[120px]">Votes</TableHead>
                    <TableHead className="w-[150px]">Updated</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bugReports.map((bug) => (
                    <TableRow key={bug.id} className="hover:bg-gray-800/50 border-gray-800">
                      <TableCell className="font-mono text-xs">{bug.id}</TableCell>
                      <TableCell>
                        <Link href={`/admin/beta-dashboard/bugs/${bug.id}`} className="hover:text-blue-400">
                          {bug.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            bug.status === "open"
                              ? "border-red-500 text-red-500"
                              : bug.status === "in-progress"
                                ? "border-yellow-500 text-yellow-500"
                                : "border-green-500 text-green-500"
                          }
                        >
                          {bug.status === "open" ? (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          ) : bug.status === "in-progress" ? (
                            <Clock className="h-3 w-3 mr-1" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {bug.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            bug.severity === "high"
                              ? "border-red-500 text-red-500"
                              : bug.severity === "medium"
                                ? "border-yellow-500 text-yellow-500"
                                : "border-green-500 text-green-500"
                          }
                        >
                          {bug.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{bug.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <ThumbsUp className="h-3 w-3 mr-1 text-purple-500" />
                          {bug.votes}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">{formatDate(bug.updated)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                            <DropdownMenuItem className="focus:bg-gray-800">View Details</DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-gray-800">Change Status</DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-gray-800">Assign</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-800" />
                            <DropdownMenuItem className="text-red-500 focus:bg-gray-800 focus:text-red-500">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-0">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-800">
                  <TableRow className="hover:bg-gray-800/50 border-gray-800">
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px]">Priority</TableHead>
                    <TableHead className="w-[120px]">Category</TableHead>
                    <TableHead className="w-[120px]">Votes</TableHead>
                    <TableHead className="w-[150px]">Updated</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureRequests.map((feature) => (
                    <TableRow key={feature.id} className="hover:bg-gray-800/50 border-gray-800">
                      <TableCell className="font-mono text-xs">{feature.id}</TableCell>
                      <TableCell>
                        <Link href={`/admin/beta-dashboard/features/${feature.id}`} className="hover:text-blue-400">
                          {feature.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            feature.status === "planned"
                              ? "border-green-500 text-green-500"
                              : "border-blue-500 text-blue-500"
                          }
                        >
                          {feature.status === "planned" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {feature.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            feature.priority === "high"
                              ? "border-red-500 text-red-500"
                              : feature.priority === "medium"
                                ? "border-yellow-500 text-yellow-500"
                                : "border-green-500 text-green-500"
                          }
                        >
                          {feature.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{feature.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <ThumbsUp className="h-3 w-3 mr-1 text-purple-500" />
                          {feature.votes}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">{formatDate(feature.updated)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                            <DropdownMenuItem className="focus:bg-gray-800">View Details</DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-gray-800">Change Status</DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-gray-800">Change Priority</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-800" />
                            <DropdownMenuItem className="text-red-500 focus:bg-gray-800 focus:text-red-500">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="mt-0">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-800">
                  <TableRow className="hover:bg-gray-800/50 border-gray-800">
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[120px]">Type</TableHead>
                    <TableHead className="w-[120px]">Category</TableHead>
                    <TableHead className="w-[120px]">Votes</TableHead>
                    <TableHead className="w-[150px]">Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generalFeedback.map((feedback) => (
                    <TableRow key={feedback.id} className="hover:bg-gray-800/50 border-gray-800">
                      <TableCell className="font-mono text-xs">{feedback.id}</TableCell>
                      <TableCell>
                        <Link href={`/admin/beta-dashboard/feedback/${feedback.id}`} className="hover:text-blue-400">
                          {feedback.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            feedback.type === "positive"
                              ? "border-green-500 text-green-500"
                              : "border-blue-500 text-blue-500"
                          }
                        >
                          {feedback.type === "positive" ? (
                            <ThumbsUp className="h-3 w-3 mr-1" />
                          ) : (
                            <Lightbulb className="h-3 w-3 mr-1" />
                          )}
                          {feedback.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{feedback.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <ThumbsUp className="h-3 w-3 mr-1 text-purple-500" />
                          {feedback.votes}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">{formatDate(feedback.created)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                            <DropdownMenuItem className="focus:bg-gray-800">View Details</DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-gray-800">Convert to Feature</DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-gray-800">Convert to Bug</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-800" />
                            <DropdownMenuItem className="text-red-500 focus:bg-gray-800 focus:text-red-500">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
