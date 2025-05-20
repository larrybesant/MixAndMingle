"use client"

import { TableHeader } from "@/components/ui/table"

import { useState, useEffect } from "react"
import { doc, getDoc, getDocs, query, collection, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, CheckCircle, LineChart, MessageSquare, Users } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"

interface ReportParams {
  params: {
    reportId: string
  }
}

export default function BetaReportPage({ params }: ReportParams) {
  const { reportId } = params
  const [report, setReport] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) return

      try {
        const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)))

        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data()
          if (userData.role !== "admin") {
            redirect("/dashboard")
          }
        } else {
          redirect("/dashboard")
        }
      } catch (error) {
        console.error("Error checking admin access:", error)
        redirect("/dashboard")
      }
    }

    checkAdminAccess()
  }, [user])

  useEffect(() => {
    const fetchReport = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const reportDoc = await getDoc(doc(db, "betaReports", reportId))

        if (reportDoc.exists()) {
          setReport(reportDoc.data())
        } else {
          redirect("/admin/reports")
        }
      } catch (error) {
        console.error("Error fetching report:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchReport()
    }
  }, [reportId, user])

  if (!user || isLoading) {
    return (
      <div className="container py-8 max-w-7xl">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container py-8 max-w-7xl">
        <div className="flex flex-col items-center justify-center h-96">
          <h2 className="text-2xl font-bold mb-4">Report Not Found</h2>
          <Button asChild>
            <Link href="/admin/reports">Back to Reports</Link>
          </Button>
        </div>
      </div>
    )
  }

  const startDate = report.period.start.toDate()
  const endDate = report.period.end.toDate()

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/admin/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Beta Report</h1>
          <p className="text-muted-foreground">
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link href="/admin/analytics">View Live Analytics</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Testers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.metrics.activeTesters}</div>
            <p className="text-xs text-muted-foreground">{report.metrics.newTesters} new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Items</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.metrics.totalFeedback}</div>
            <p className="text-xs text-muted-foreground">
              {report.metrics.bugReports} bugs, {report.metrics.suggestions} suggestions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.metrics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Avg {report.metrics.averageTasksCompleted.toFixed(1)} tasks completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Key insights from this week's beta testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {report.summary.highlights.length > 0 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Highlights</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {report.summary.highlights.map((highlight: string, index: number) => (
                      <li key={index} className="text-green-700">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {report.summary.concerns.length > 0 && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Areas of Concern</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {report.summary.concerns.map((concern: string, index: number) => (
                      <li key={index} className="text-amber-700">
                        {concern}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {report.summary.recommendations.length > 0 && (
              <Alert>
                <AlertTitle>Recommendations</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {report.summary.recommendations.map((recommendation: string, index: number) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="engagement">
          <TabsList className="mb-4">
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Daily active users and session data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Daily Active Users</h3>
                    <div className="h-[300px] mt-2">
                      {/* We would render a chart here with the dailyActiveUsers data */}
                      <div className="flex items-center justify-center h-full border rounded-md">
                        <p className="text-muted-foreground">Chart visualization would appear here</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 mt-6">
                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="font-medium mb-1">Average Session Time</h4>
                      <p className="text-2xl font-bold">{report.engagement.averageSessionTime} minutes</p>
                    </div>
                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="font-medium mb-1">Total Sessions</h4>
                      <p className="text-2xl font-bold">{report.engagement.totalSessions}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium">Retention</h3>
                    <div className="grid gap-4 md:grid-cols-3 mt-2">
                      <div className="bg-muted p-4 rounded-md">
                        <h4 className="font-medium mb-1">Weekly Retention</h4>
                        <p className="text-2xl font-bold">{report.retention.weeklyRetentionRate.toFixed(1)}%</p>
                      </div>
                      <div className="bg-muted p-4 rounded-md">
                        <h4 className="font-medium mb-1">Previous Week</h4>
                        <p className="text-2xl font-bold">{report.retention.previousWeekRetentionRate.toFixed(1)}%</p>
                      </div>
                      <div className="bg-muted p-4 rounded-md">
                        <h4 className="font-medium mb-1">Change</h4>
                        <p
                          className={`text-2xl font-bold ${report.retention.retentionChange >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {report.retention.retentionChange >= 0 ? "+" : ""}
                          {report.retention.retentionChange.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Analysis</CardTitle>
                <CardDescription>Top feedback items and categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Top Feedback Items</h3>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Votes</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.feedback.topFeedbackItems.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.title}</TableCell>
                              <TableCell>{item.type}</TableCell>
                              <TableCell>{item.votes}</TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    item.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : item.status === "in-progress"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Feedback by Category</h3>
                    <div className="h-[300px]">
                      {/* We would render a chart here with the feedbackByCategory data */}
                      <div className="flex items-center justify-center h-full border rounded-md">
                        <p className="text-muted-foreground">Chart visualization would appear here</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Task Completion</CardTitle>
                <CardDescription>Beta testing task completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.tasks.taskCompletionRates.map((task: any) => (
                    <div key={task.taskId} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{task.taskName}</span>
                        <span>{task.completionRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${task.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
