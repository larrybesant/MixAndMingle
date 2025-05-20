"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export function BetaAnalyticsSummary() {
  const [timeRange, setTimeRange] = useState("7d")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTesters: 0,
    activeTesters: 0,
    totalFeedback: 0,
    completedChallenges: 0,
    averageSessionTime: 0,
  })
  const [activityData, setActivityData] = useState<any[]>([])
  const [feedbackData, setFeedbackData] = useState<any[]>([])
  const [retentionData, setRetentionData] = useState<any[]>([])

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)

      try {
        // Get date range
        const endDate = new Date()
        const startDate = new Date()

        switch (timeRange) {
          case "7d":
            startDate.setDate(endDate.getDate() - 7)
            break
          case "30d":
            startDate.setDate(endDate.getDate() - 30)
            break
          case "90d":
            startDate.setDate(endDate.getDate() - 90)
            break
        }

        // Fetch beta testers
        const testersQuery = query(collection(db, "users"), where("isBetaTester", "==", true))
        const testersSnapshot = await getDocs(testersQuery)

        // Fetch active testers
        const activeTestersQuery = query(
          collection(db, "users"),
          where("isBetaTester", "==", true),
          where("lastActive", ">=", startDate),
        )
        const activeTestersSnapshot = await getDocs(activeTestersQuery)

        // Fetch feedback
        const feedbackQuery = query(collection(db, "feedback"), where("createdAt", ">=", startDate))
        const feedbackSnapshot = await getDocs(feedbackQuery)

        // Fetch challenges
        const challengesQuery = query(collection(db, "completedChallenges"), where("completedAt", ">=", startDate))
        const challengesSnapshot = await getDocs(challengesQuery)

        // Calculate stats
        const totalTesters = testersSnapshot.size
        const activeTesters = activeTestersSnapshot.size
        const totalFeedback = feedbackSnapshot.size
        const completedChallenges = challengesSnapshot.size

        // Calculate average session time (mock data for now)
        const averageSessionTime = Math.floor(Math.random() * 20) + 5 // 5-25 minutes

        setStats({
          totalTesters,
          activeTesters,
          totalFeedback,
          completedChallenges,
          averageSessionTime,
        })

        // Generate activity data (mock data for demonstration)
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
        const activityData = []

        for (let i = 0; i < days; i++) {
          const date = new Date()
          date.setDate(date.getDate() - i)

          activityData.unshift({
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            logins: Math.floor(Math.random() * 50) + 10,
            feedback: Math.floor(Math.random() * 15),
            challenges: Math.floor(Math.random() * 20),
          })
        }

        setActivityData(activityData)

        // Generate feedback data (mock data for demonstration)
        const feedbackCategories = [
          { name: "UI/UX", value: Math.floor(Math.random() * 40) + 20 },
          { name: "Features", value: Math.floor(Math.random() * 30) + 15 },
          { name: "Performance", value: Math.floor(Math.random() * 25) + 10 },
          { name: "Bugs", value: Math.floor(Math.random() * 20) + 5 },
          { name: "Other", value: Math.floor(Math.random() * 15) + 5 },
        ]

        setFeedbackData(feedbackCategories)

        // Generate retention data (mock data for demonstration)
        const retentionData = [
          { day: 1, retention: 100 },
          { day: 2, retention: Math.floor(Math.random() * 20) + 75 },
          { day: 3, retention: Math.floor(Math.random() * 20) + 60 },
          { day: 7, retention: Math.floor(Math.random() * 20) + 45 },
          { day: 14, retention: Math.floor(Math.random() * 20) + 30 },
          { day: 30, retention: Math.floor(Math.random() * 15) + 20 },
        ]

        setRetentionData(retentionData)
      } catch (error) {
        console.error("Error fetching beta analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  const COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c"]

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="text-center mt-4">Loading analytics...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.totalTesters}</CardTitle>
            <CardDescription>Total Beta Testers</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.activeTesters}</CardTitle>
            <CardDescription>Active Testers</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.totalFeedback}</CardTitle>
            <CardDescription>Feedback Items</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.completedChallenges}</CardTitle>
            <CardDescription>Completed Challenges</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="activity">
        <TabsList className="mb-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Beta Tester Activity</CardTitle>
              <CardDescription>Daily activity metrics for beta testers</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="logins" name="Logins" fill="#8884d8" />
                    <Bar dataKey="feedback" name="Feedback" fill="#82ca9d" />
                    <Bar dataKey="challenges" name="Challenges" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Distribution</CardTitle>
              <CardDescription>Breakdown of feedback by category</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={feedbackData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {feedbackData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle>Beta Tester Retention</CardTitle>
              <CardDescription>Percentage of users returning after N days</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={retentionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12 }}
                      label={{ value: "Days Since First Login", position: "insideBottom", offset: -40 }}
                    />
                    <YAxis label={{ value: "Retention %", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Bar dataKey="retention" name="Retention %" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
