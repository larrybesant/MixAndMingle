"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { DateRangePicker } from "@/components/analytics/date-range-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeedbackTrendChart } from "@/components/analytics/feedback-trend-chart"
import { CategoryDistributionChart } from "@/components/analytics/category-distribution-chart"
import { TopFeatureRequests } from "@/components/analytics/top-feature-requests"
import { TagCloud } from "@/components/analytics/tag-cloud"
import { feedbackAnalyticsService } from "@/lib/feedback-analytics-service"

export default function BetaFeedbackAnalytics() {
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  })
  const [analyticsData, setAnalyticsData] = useState({
    trends: [],
    categoryDistribution: [],
    tagCloud: [],
    topRequests: [],
    totalFeedback: 0,
  })

  const { user } = useAuth()

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Fetch main analytics data
        const data = await feedbackAnalyticsService.getFeedbackAnalytics(dateRange.from, dateRange.to)

        // Only include the data needed for this simplified view
        setAnalyticsData({
          trends: data.trends,
          categoryDistribution: data.categoryDistribution,
          tagCloud: data.tagCloud,
          topRequests: data.topRequests,
          totalFeedback: data.totalFeedback,
        })
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchAnalyticsData()
    }
  }, [dateRange, user])

  if (!user) {
    return null
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Feedback Trends</h1>
          <p className="text-muted-foreground">See how the community is providing feedback</p>
        </div>
        <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
      </div>

      {/* Overview Card */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Total Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {isLoading ? <div className="animate-pulse h-10 w-20 bg-muted rounded"></div> : analyticsData.totalFeedback}
          </div>
          <p className="text-muted-foreground">items in selected period</p>
        </CardContent>
      </Card>

      {/* Main Charts */}
      <Tabs defaultValue="trends" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="requests">Top Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <FeedbackTrendChart trends={analyticsData.trends} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CategoryDistributionChart data={analyticsData.categoryDistribution} isLoading={isLoading} />
            <TagCloud data={analyticsData.tagCloud} isLoading={isLoading} />
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <TopFeatureRequests data={analyticsData.topRequests} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>What This Means</CardTitle>
          <CardDescription>Understanding the feedback data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This dashboard shows the collective feedback from all beta testers. Here's how to interpret it:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Trends</span>: Shows how feedback volume changes over time
            </li>
            <li>
              <span className="font-medium text-foreground">Categories</span>: Displays what types of feedback are most
              common
            </li>
            <li>
              <span className="font-medium text-foreground">Top Requests</span>: Highlights the most requested features
            </li>
            <li>
              <span className="font-medium text-foreground">Tag Cloud</span>: Visualizes common themes in feedback
            </li>
          </ul>

          <p className="mt-4 text-muted-foreground">
            Your feedback is valuable! The more specific and detailed your feedback is, the better we can understand
            what's working and what needs improvement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
