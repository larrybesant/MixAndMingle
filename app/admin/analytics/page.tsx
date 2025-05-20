"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BetaOverviewMetrics } from "@/components/analytics/beta-overview-metrics"
import { BetaEngagementChart } from "@/components/analytics/beta-engagement-chart"
import { BetaFeedbackAnalytics } from "@/components/analytics/beta-feedback-analytics"
import { BetaTaskCompletionChart } from "@/components/analytics/beta-task-completion-chart"
import { BetaUserActivityTable } from "@/components/analytics/beta-user-activity-table"
import { BetaRetentionChart } from "@/components/analytics/beta-retention-chart"
import { BetaFunnelChart } from "@/components/analytics/beta-funnel-chart"
import { DateRangePicker } from "@/components/analytics/date-range-picker"
import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"

export default function BetaAnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  })
  const [betaMetrics, setBetaMetrics] = useState({
    totalTesters: 0,
    activeTesters: 0,
    totalFeedback: 0,
    bugReports: 0,
    suggestions: 0,
    generalFeedback: 0,
    averageTasksCompleted: 0,
    completionRate: 0,
  })
  const [userRoles, setUserRoles] = useState<Record<string, string>>({})

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
    const fetchBetaMetrics = async () => {
      setIsLoading(true)
      try {
        // Fetch users with beta tester role
        const usersQuery = query(collection(db, "users"), where("role", "==", "beta_tester"))
        const usersSnapshot = await getDocs(usersQuery)

        const totalTesters = usersSnapshot.size
        let activeTesters = 0
        let totalTasksCompleted = 0

        // Store user roles for later use
        const roles: Record<string, string> = {}

        usersSnapshot.forEach((doc) => {
          const userData = doc.data()
          roles[doc.id] = userData.role || "beta_tester"

          // Check if user was active in the selected date range
          const lastActive = userData.lastActive?.toDate() || new Date(0)
          if (lastActive >= dateRange.from && lastActive <= dateRange.to) {
            activeTesters++
          }

          // Count completed tasks
          totalTasksCompleted += userData.betaStatus?.tasksCompleted || 0
        })

        setUserRoles(roles)

        // Fetch feedback within date range
        const fromTimestamp = dateRange.from
        const toTimestamp = dateRange.to

        const feedbackQuery = query(
          collection(db, "betaFeedback"),
          where("createdAt", ">=", fromTimestamp),
          where("createdAt", "<=", toTimestamp),
        )
        const feedbackSnapshot = await getDocs(feedbackQuery)

        let bugReports = 0
        let suggestions = 0
        let generalFeedback = 0

        feedbackSnapshot.forEach((doc) => {
          const feedbackData = doc.data()
          switch (feedbackData.type) {
            case "bug":
              bugReports++
              break
            case "suggestion":
              suggestions++
              break
            default:
              generalFeedback++
          }
        })

        // Calculate metrics
        const averageTasksCompleted = totalTesters > 0 ? totalTasksCompleted / totalTesters : 0
        const completionRate = totalTesters > 0 ? (activeTesters / totalTesters) * 100 : 0

        setBetaMetrics({
          totalTesters,
          activeTesters,
          totalFeedback: feedbackSnapshot.size,
          bugReports,
          suggestions,
          generalFeedback,
          averageTasksCompleted,
          completionRate,
        })
      } catch (error) {
        console.error("Error fetching beta metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchBetaMetrics()
    }
  }, [dateRange, user])

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Beta Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track engagement and feedback metrics for your beta program</p>
        </div>
        <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <BetaOverviewMetrics metrics={betaMetrics} />

          <Tabs defaultValue="engagement" className="mt-8">
            <TabsList className="mb-4">
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="tasks">Task Completion</TabsTrigger>
              <TabsTrigger value="users">User Activity</TabsTrigger>
              <TabsTrigger value="retention">Retention</TabsTrigger>
              <TabsTrigger value="funnel">Funnel</TabsTrigger>
            </TabsList>

            <TabsContent value="engagement">
              <Card>
                <CardHeader>
                  <CardTitle>Beta Tester Engagement</CardTitle>
                  <CardDescription>Daily active users and session metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <BetaEngagementChart dateRange={dateRange} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback">
              <Card>
                <CardHeader>
                  <CardTitle>Feedback Analysis</CardTitle>
                  <CardDescription>Breakdown of feedback by type and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <BetaFeedbackAnalytics dateRange={dateRange} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>Task Completion Rates</CardTitle>
                  <CardDescription>Percentage of users completing each beta task</CardDescription>
                </CardHeader>
                <CardContent>
                  <BetaTaskCompletionChart />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>Detailed breakdown of individual beta tester activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <BetaUserActivityTable userRoles={userRoles} dateRange={dateRange} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="retention">
              <Card>
                <CardHeader>
                  <CardTitle>Beta Tester Retention</CardTitle>
                  <CardDescription>Weekly retention rates of beta testers</CardDescription>
                </CardHeader>
                <CardContent>
                  <BetaRetentionChart dateRange={dateRange} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="funnel">
              <BetaFunnelChart />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
