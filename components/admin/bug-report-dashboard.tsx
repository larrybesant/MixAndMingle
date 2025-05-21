"use client"

import { useState, useEffect } from "react"
import { useFirebase } from "@/hooks/use-firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BugIcon,
  CheckCircleIcon,
  ClockIcon,
  FilterIcon,
  SearchIcon,
  AlertTriangleIcon,
  ExternalLinkIcon,
} from "lucide-react"
import { captureError } from "@/lib/sentry"

// Bug report type
interface BugReport {
  id: string
  title: string
  description: string
  steps: string
  expected: string
  severity: "low" | "medium" | "high" | "critical"
  status: "new" | "in-progress" | "resolved" | "wont-fix" | "duplicate"
  device: string
  browser: string
  url: string
  screenshot: string
  createdAt: any
  userId: string
  userEmail: string
  userName: string
  assignedTo?: string
  notes?: string
  resolution?: string
}

export function BugReportDashboard() {
  const { getCollection, updateDocument } = useFirebase()
  const [bugReports, setBugReports] = useState<BugReport[]>([])
  const [filteredReports, setFilteredReports] = useState<BugReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Load bug reports
  useEffect(() => {
    const loadBugReports = async () => {
      try {
        setLoading(true)
        const reports = await getCollection("bugReports")

        // Sort by creation date (newest first) and severity
        const sortedReports = reports.sort((a: BugReport, b: BugReport) => {
          // First sort by status (new first)
          if (a.status === "new" && b.status !== "new") return -1
          if (a.status !== "new" && b.status === "new") return 1

          // Then sort by severity
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
          if (severityOrder[a.severity] !== severityOrder[b.severity]) {
            return severityOrder[a.severity] - severityOrder[b.severity]
          }

          // Finally sort by date
          return b.createdAt.toDate() - a.createdAt.toDate()
        })

        setBugReports(sortedReports)
        setFilteredReports(sortedReports)
      } catch (error) {
        console.error("Error loading bug reports:", error)
        captureError(error instanceof Error ? error : new Error("Failed to load bug reports"))
      } finally {
        setLoading(false)
      }
    }

    loadBugReports()
  }, [getCollection])

  // Apply filters
  useEffect(() => {
    let filtered = [...bugReports]

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter)
    }

    // Apply severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter((report) => report.severity === severityFilter)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(query) ||
          report.description.toLowerCase().includes(query) ||
          report.userName.toLowerCase().includes(query) ||
          report.userEmail.toLowerCase().includes(query),
      )
    }

    // Apply tab filter
    if (activeTab === "new") {
      filtered = filtered.filter((report) => report.status === "new")
    } else if (activeTab === "in-progress") {
      filtered = filtered.filter((report) => report.status === "in-progress")
    } else if (activeTab === "resolved") {
      filtered = filtered.filter(
        (report) => report.status === "resolved" || report.status === "wont-fix" || report.status === "duplicate",
      )
    }

    setFilteredReports(filtered)
  }, [bugReports, statusFilter, severityFilter, searchQuery, activeTab])

  // Update bug report status
  const updateBugStatus = async (id: string, status: string) => {
    try {
      await updateDocument("bugReports", id, { status })

      // Update local state
      setBugReports((prev) => prev.map((report) => (report.id === id ? { ...report, status: status as any } : report)))

      // Update selected report if open
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport({ ...selectedReport, status: status as any })
      }
    } catch (error) {
      console.error("Error updating bug status:", error)
      captureError(error instanceof Error ? error : new Error("Failed to update bug status"))
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="destructive">New</Badge>
      case "in-progress":
        return (
          <Badge variant="default" className="bg-blue-500">
            In Progress
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="default" className="bg-green-500">
            Resolved
          </Badge>
        )
      case "wont-fix":
        return <Badge variant="outline">Won't Fix</Badge>
      case "duplicate":
        return <Badge variant="outline">Duplicate</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "high":
        return (
          <Badge variant="default" className="bg-orange-500">
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="default" className="bg-yellow-500 text-black">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="default" className="bg-green-500">
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  // Format date
  const formatDate = (date: any) => {
    if (!date) return "Unknown"
    if (typeof date.toDate === "function") {
      return new Date(date.toDate()).toLocaleString()
    }
    return new Date(date).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bug Reports Dashboard</CardTitle>
          <CardDescription>Manage and track bug reports from beta testers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search bug reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="wont-fix">Won't Fix</SelectItem>
                  <SelectItem value="duplicate">Duplicate</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <AlertTriangleIcon className="mr-2 h-4 w-4" />
                    <span>Severity</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Reports</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading bug reports...</p>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-8 border rounded-md">
                  <BugIcon className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No bug reports found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || statusFilter !== "all" || severityFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Bug reports from beta testers will appear here"}
                  </p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.title}</TableCell>
                          <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell>{report.userName || report.userEmail}</TableCell>
                          <TableCell>{formatDate(report.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                                    View
                                  </Button>
                                </DialogTrigger>
                                {selectedReport && (
                                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <BugIcon className="h-5 w-5 text-red-500" />
                                        {selectedReport.title}
                                      </DialogTitle>
                                      <DialogDescription>
                                        Reported by {selectedReport.userName || selectedReport.userEmail} on{" "}
                                        {formatDate(selectedReport.createdAt)}
                                      </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                      <div className="md:col-span-2 space-y-4">
                                        <div>
                                          <h4 className="text-sm font-medium mb-1">Description</h4>
                                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md whitespace-pre-wrap">
                                            {selectedReport.description}
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="text-sm font-medium mb-1">Steps to Reproduce</h4>
                                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md whitespace-pre-wrap">
                                            {selectedReport.steps}
                                          </div>
                                        </div>

                                        {selectedReport.expected && (
                                          <div>
                                            <h4 className="text-sm font-medium mb-1">Expected Behavior</h4>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md whitespace-pre-wrap">
                                              {selectedReport.expected}
                                            </div>
                                          </div>
                                        )}

                                        {selectedReport.screenshot && (
                                          <div>
                                            <h4 className="text-sm font-medium mb-1">Screenshot</h4>
                                            <a
                                              href={selectedReport.screenshot}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="block"
                                            >
                                              <img
                                                src={selectedReport.screenshot || "/placeholder.svg"}
                                                alt="Bug screenshot"
                                                className="max-h-[300px] rounded-md border border-gray-200 dark:border-gray-700"
                                              />
                                            </a>
                                          </div>
                                        )}
                                      </div>

                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="text-sm font-medium mb-1">Status</h4>
                                          <Select
                                            value={selectedReport.status}
                                            onValueChange={(value) => updateBugStatus(selectedReport.id, value)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="new">New</SelectItem>
                                              <SelectItem value="in-progress">In Progress</SelectItem>
                                              <SelectItem value="resolved">Resolved</SelectItem>
                                              <SelectItem value="wont-fix">Won't Fix</SelectItem>
                                              <SelectItem value="duplicate">Duplicate</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        <div>
                                          <h4 className="text-sm font-medium mb-1">Severity</h4>
                                          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                            {getSeverityBadge(selectedReport.severity)}
                                          </div>
                                        </div>

                                        {selectedReport.url && (
                                          <div>
                                            <h4 className="text-sm font-medium mb-1">URL</h4>
                                            <a
                                              href={selectedReport.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center text-blue-500 hover:underline"
                                            >
                                              <span className="truncate">{selectedReport.url}</span>
                                              <ExternalLinkIcon className="ml-1 h-3 w-3" />
                                            </a>
                                          </div>
                                        )}

                                        <div>
                                          <h4 className="text-sm font-medium mb-1">Device</h4>
                                          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                                            {selectedReport.device || "Not specified"}
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="text-sm font-medium mb-1">Browser</h4>
                                          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                                            {selectedReport.browser || "Not specified"}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <DialogFooter className="mt-6">
                                      <div className="flex gap-2 w-full justify-between">
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateBugStatus(selectedReport.id, "in-progress")}
                                            disabled={selectedReport.status === "in-progress"}
                                          >
                                            <ClockIcon className="mr-1 h-4 w-4" />
                                            Mark In Progress
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateBugStatus(selectedReport.id, "resolved")}
                                            disabled={selectedReport.status === "resolved"}
                                            className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                                          >
                                            <CheckCircleIcon className="mr-1 h-4 w-4" />
                                            Mark Resolved
                                          </Button>
                                        </div>
                                        <DialogClose asChild>
                                          <Button variant="outline">Close</Button>
                                        </DialogClose>
                                      </div>
                                    </DialogFooter>
                                  </DialogContent>
                                )}
                              </Dialog>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateBugStatus(report.id, "resolved")}
                                disabled={report.status === "resolved"}
                                className="text-green-600"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
