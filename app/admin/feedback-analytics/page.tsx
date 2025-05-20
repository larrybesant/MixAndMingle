"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { DateRangePicker } from "@/components/analytics/date-range-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeedbackTrendChart } from "@/components/analytics/feedback-trend-chart"
import { CategoryDistributionChart } from "@/components/analytics/category-distribution-chart"
import { SentimentDistributionChart } from "@/components/analytics/sentiment-distribution-chart"
import { FeatureHeatmap } from "@/components/analytics/feature-heatmap"
import { TagCloud } from "@/components/analytics/tag-cloud"
import { TopFeatureRequests } from "@/components/analytics/top-feature-requests"
import { FeedbackByDay } from "@/components/analytics/feedback-by-day"
import { ResponseTimeChart } from "@/components/analytics/response-time-chart"
import { feedbackAnalyticsService, type FeedbackAnalyticsData } from "@/lib/feedback-analytics-service"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function FeedbackAnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  })
  const [analyticsData, setAnalyticsData] = useState<FeedbackAnalyticsData>({
    trends: [],
    categoryDistribution: [],
    sentimentDistribution: [],
    featureHeatmap: [],
    tagCloud: [],
    topRequests: [],
    totalFeedback: 0,
    averageSentiment: 0,
  })
  const [feedbackByDay, setFeedbackByDay] = useState<{ day: string; count: number }[]>([])
  const [responseTimes, setResponseTimes] = useState<{ responseTime: string; count: number }[]>([])

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
    const fetchAnalyticsData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Fetch main analytics data
        const data = await feedbackAnalyticsService.getFeedbackAnalytics(dateRange.from, dateRange.to)
        setAnalyticsData(data)

        // Fetch feedback by day of week
        const dayData = await feedbackAnalyticsService.getFeedbackByDayOfWeek(dateRange.from, dateRange.to)
        setFeedbackByDay(dayData)

        // Fetch response times
        const responseData = await feedbackAnalyticsService.getFeedbackResponseTimes(dateRange.from, dateRange.to)
        setResponseTimes(responseData)
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
    return null // Will redirect in useEffect
  }

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Feedback Analytics Dashboard</h1>
          <p className="text-muted-foreground">Visualize and analyze beta tester feedback</p>
        </div>
        <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {isLoading ? (
                <div className="animate-pulse h-10 w-20 bg-muted rounded"></div>
              ) : (
                analyticsData.totalFeedback
              )}
            </div>
            <p className="text-muted-foreground">items in selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Average Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {isLoading ? (
                <div className="animate-pulse h-10 w-20 bg-muted rounded"></div>
              ) : (
                analyticsData.averageSentiment.toFixed(2)
              )}
            </div>
            <p className="text-muted-foreground">
              {isLoading
                ? "Loading..."
                : analyticsData.averageSentiment > 0.3
                  ? "Positive feedback trend"
                  : analyticsData.averageSentiment < -0.3
                    ? "Negative feedback trend"
                    : "Neutral feedback trend"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {isLoading ? (
                <div className="animate-pulse h-10 w-20 bg-muted rounded"></div>
              ) : analyticsData.categoryDistribution.length > 0 ? (
                analyticsData.categoryDistribution.sort((a, b) => b.count - a.count)[0].category
              ) : (
                "No data"
              )}
            </div>
            <p className="text-muted-foreground">
              {isLoading
                ? "Loading..."
                : analyticsData.categoryDistribution.length > 0
                  ? `${analyticsData.categoryDistribution.sort((a, b) => b.count - a.count)[0].count} items`
                  : "No categories found"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="trends" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeedbackTrendChart trends={analyticsData.trends} isLoading={isLoading} />
            <SentimentDistributionChart
              data={analyticsData.sentimentDistribution}
              averageSentiment={analyticsData.averageSentiment}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="distribution">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CategoryDistributionChart data={analyticsData.categoryDistribution} isLoading={isLoading} />
            <TagCloud data={analyticsData.tagCloud} isLoading={isLoading} />
          </div>
        </TabsContent>

        <TabsContent value="features">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopFeatureRequests data={analyticsData.topRequests} isLoading={isLoading} />
            <FeatureHeatmap data={analyticsData.featureHeatmap} isLoading={isLoading} />
          </div>
        </TabsContent>

        <TabsContent value="timing">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeedbackByDay data={feedbackByDay} isLoading={isLoading} />
            <ResponseTimeChart data={responseTimes} isLoading={isLoading} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Insights</CardTitle>
          <CardDescription>Key takeaways from the feedback data</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="animate-pulse h-4 w-full bg-muted rounded"></div>
              <div className="animate-pulse h-4 w-5/6 bg-muted rounded"></div>
              <div className="animate-pulse h-4 w-4/6 bg-muted rounded"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Volume Trends</h3>
                <p className="text-muted-foreground">
                  {analyticsData.trends.length > 0
                    ? `Feedback volume is ${
                        analyticsData.trends[0].count < analyticsData.trends[analyticsData.trends.length - 1].count
                          ? "increasing"
                          : "decreasing"
                      } over the selected period.`
                    : "No trend data available for the selected period."}
                </p>
              </div>

              <div>
                <h3 className="font-medium">Sentiment Analysis</h3>
                <p className="text-muted-foreground">
                  {analyticsData.sentimentDistribution.length > 0
                    ? `The overall sentiment is ${
                        analyticsData.averageSentiment > 0.3
                          ? "positive"
                          : analyticsData.averageSentiment < -0.3
                            ? "negative"
                            : "neutral"
                      }, with ${
                        analyticsData.sentimentDistribution.sort((a, b) => b.count - a.count)[0].sentiment
                      } feedback being most common.`
                    : "No sentiment data available for the selected period."}
                </p>
              </div>

              <div>
                <h3 className="font-medium">Feature Priorities</h3>
                <p className="text-muted-foreground">
                  {analyticsData.topRequests.length > 0
                    ? `The most requested feature is "${analyticsData.topRequests[0].feature}" with ${analyticsData.topRequests[0].count} requests.`
                    : "No feature request data available for the selected period."}
                </p>
              </div>

              <div>
                <h3 className="font-medium">Timing Patterns</h3>
                <p className="text-muted-foreground">
                  {feedbackByDay.length > 0
                    ? `Users are most active with feedback on ${
                        feedbackByDay.sort((a, b) => b.count - a.count)[0].day
                      }.`
                    : "No timing data available for the selected period."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
