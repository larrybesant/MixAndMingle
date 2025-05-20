import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Define types for our analytics data
export interface FeedbackTrend {
  date: string
  count: number
  category?: string
  sentiment?: string
}

export interface CategoryDistribution {
  category: string
  count: number
}

export interface SentimentDistribution {
  sentiment: string
  count: number
}

export interface FeatureHeatmapItem {
  feature: string
  category: string
  count: number
}

export interface TagCloudItem {
  text: string
  value: number
}

export interface FeedbackAnalyticsData {
  trends: FeedbackTrend[]
  categoryDistribution: CategoryDistribution[]
  sentimentDistribution: SentimentDistribution[]
  featureHeatmap: FeatureHeatmapItem[]
  tagCloud: TagCloudItem[]
  topRequests: { feature: string; count: number }[]
  totalFeedback: number
  averageSentiment: number
}

class FeedbackAnalyticsService {
  // Fetch feedback analytics data for a given date range
  async getFeedbackAnalytics(
    startDate: Date,
    endDate: Date,
    filters: { categories?: string[]; features?: string[]; sentiment?: string[] } = {},
  ): Promise<FeedbackAnalyticsData> {
    try {
      // Create base query with date range
      const feedbackQuery = query(
        collection(db, "betaFeedback"),
        where("createdAt", ">=", Timestamp.fromDate(startDate)),
        where("createdAt", "<=", Timestamp.fromDate(endDate)),
        orderBy("createdAt", "asc"),
      )

      // Apply additional filters if provided
      // Note: In a real implementation, we would need to create composite indexes
      // or use multiple queries for complex filtering

      const snapshot = await getDocs(feedbackQuery)
      const feedbackItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      // Process the data for different visualizations
      return this.processAnalyticsData(feedbackItems, startDate, endDate)
    } catch (error) {
      console.error("Error fetching feedback analytics:", error)
      throw error
    }
  }

  // Process raw feedback data into visualization-ready formats
  private processAnalyticsData(feedbackItems: any[], startDate: Date, endDate: Date): FeedbackAnalyticsData {
    // Initialize result object
    const result: FeedbackAnalyticsData = {
      trends: [],
      categoryDistribution: [],
      sentimentDistribution: [],
      featureHeatmap: [],
      tagCloud: [],
      topRequests: [],
      totalFeedback: feedbackItems.length,
      averageSentiment: 0,
    }

    // Skip processing if no data
    if (feedbackItems.length === 0) {
      return result
    }

    // Process trends (feedback count by day)
    const trendMap = new Map<
      string,
      { total: number; byCategory: Map<string, number>; bySentiment: Map<string, number> }
    >()

    // Create date range for all days between start and end
    const dateRange = this.generateDateRange(startDate, endDate)
    dateRange.forEach((date) => {
      trendMap.set(date, {
        total: 0,
        byCategory: new Map<string, number>(),
        bySentiment: new Map<string, number>(),
      })
    })

    // Count feedback by day, category, and sentiment
    feedbackItems.forEach((item) => {
      const date = new Date(item.createdAt.toDate()).toISOString().split("T")[0]
      const category = item.category || "Uncategorized"
      const sentiment = this.getSentimentLabel(item.sentiment || 0)

      const dayData = trendMap.get(date) || {
        total: 0,
        byCategory: new Map<string, number>(),
        bySentiment: new Map<string, number>(),
      }

      dayData.total += 1

      const categoryCount = dayData.byCategory.get(category) || 0
      dayData.byCategory.set(category, categoryCount + 1)

      const sentimentCount = dayData.bySentiment.get(sentiment) || 0
      dayData.bySentiment.set(sentiment, sentimentCount + 1)

      trendMap.set(date, dayData)
    })

    // Convert trend map to array
    trendMap.forEach((value, date) => {
      result.trends.push({ date, count: value.total })

      // Add category-specific trends
      value.byCategory.forEach((count, category) => {
        result.trends.push({ date, count, category })
      })

      // Add sentiment-specific trends
      value.bySentiment.forEach((count, sentiment) => {
        result.trends.push({ date, count, sentiment })
      })
    })

    // Process category distribution
    const categoryMap = new Map<string, number>()
    feedbackItems.forEach((item) => {
      const category = item.category || "Uncategorized"
      const count = categoryMap.get(category) || 0
      categoryMap.set(category, count + 1)
    })

    categoryMap.forEach((count, category) => {
      result.categoryDistribution.push({ category, count })
    })

    // Process sentiment distribution
    const sentimentMap = new Map<string, number>()
    let totalSentiment = 0

    feedbackItems.forEach((item) => {
      const sentimentValue = item.sentiment || 0
      totalSentiment += sentimentValue

      const sentiment = this.getSentimentLabel(sentimentValue)
      const count = sentimentMap.get(sentiment) || 0
      sentimentMap.set(sentiment, count + 1)
    })

    sentimentMap.forEach((count, sentiment) => {
      result.sentimentDistribution.push({ sentiment, count })
    })

    // Calculate average sentiment
    result.averageSentiment = totalSentiment / feedbackItems.length

    // Process feature heatmap
    const featureMap = new Map<string, Map<string, number>>()

    feedbackItems.forEach((item) => {
      const feature = item.feature || "General"
      const category = item.category || "Uncategorized"

      if (!featureMap.has(feature)) {
        featureMap.set(feature, new Map<string, number>())
      }

      const categoryMap = featureMap.get(feature)!
      const count = categoryMap.get(category) || 0
      categoryMap.set(category, count + 1)
    })

    featureMap.forEach((categoryMap, feature) => {
      categoryMap.forEach((count, category) => {
        result.featureHeatmap.push({ feature, category, count })
      })
    })

    // Process tag cloud
    const tagMap = new Map<string, number>()

    feedbackItems.forEach((item) => {
      const tags = item.tags || []
      tags.forEach((tag: string) => {
        const count = tagMap.get(tag) || 0
        tagMap.set(tag, count + 1)
      })
    })

    tagMap.forEach((value, text) => {
      result.tagCloud.push({ text, value })
    })

    // Process top feature requests
    const requestMap = new Map<string, number>()

    feedbackItems.forEach((item) => {
      if (item.type === "feature" || item.type === "suggestion") {
        const feature = item.feature || item.title || "Unnamed Feature"
        const count = requestMap.get(feature) || 0
        requestMap.set(feature, count + 1)
      }
    })

    // Convert to array and sort by count
    const sortedRequests = Array.from(requestMap.entries())
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10

    result.topRequests = sortedRequests

    return result
  }

  // Helper to generate a continuous date range
  private generateDateRange(startDate: Date, endDate: Date): string[] {
    const dates: string[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split("T")[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }

  // Helper to convert sentiment score to label
  private getSentimentLabel(sentiment: number): string {
    if (sentiment < -0.3) return "Negative"
    if (sentiment > 0.3) return "Positive"
    return "Neutral"
  }

  // Get feedback volume by day of week
  async getFeedbackByDayOfWeek(startDate: Date, endDate: Date): Promise<{ day: string; count: number }[]> {
    try {
      const feedbackQuery = query(
        collection(db, "betaFeedback"),
        where("createdAt", ">=", Timestamp.fromDate(startDate)),
        where("createdAt", "<=", Timestamp.fromDate(endDate)),
      )

      const snapshot = await getDocs(feedbackQuery)

      // Initialize counts for each day
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      const dayCounts = dayNames.map((day) => ({ day, count: 0 }))

      // Count feedback by day of week
      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        const date = data.createdAt.toDate()
        const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
        dayCounts[dayOfWeek].count += 1
      })

      return dayCounts
    } catch (error) {
      console.error("Error fetching feedback by day of week:", error)
      throw error
    }
  }

  // Get feedback response times
  async getFeedbackResponseTimes(startDate: Date, endDate: Date): Promise<{ responseTime: string; count: number }[]> {
    try {
      const feedbackQuery = query(
        collection(db, "betaFeedback"),
        where("createdAt", ">=", Timestamp.fromDate(startDate)),
        where("createdAt", "<=", Timestamp.fromDate(endDate)),
        where("responded", "==", true),
      )

      const snapshot = await getDocs(feedbackQuery)

      // Define response time buckets
      const responseBuckets = [
        { label: "<1 hour", maxHours: 1, count: 0 },
        { label: "1-4 hours", maxHours: 4, count: 0 },
        { label: "4-24 hours", maxHours: 24, count: 0 },
        { label: "1-3 days", maxHours: 72, count: 0 },
        { label: ">3 days", maxHours: Number.POSITIVE_INFINITY, count: 0 },
      ]

      // Count feedback by response time
      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (data.createdAt && data.respondedAt) {
          const createdTime = data.createdAt.toDate().getTime()
          const respondedTime = data.respondedAt.toDate().getTime()
          const responseHours = (respondedTime - createdTime) / (1000 * 60 * 60)

          // Find the appropriate bucket
          for (const bucket of responseBuckets) {
            if (responseHours <= bucket.maxHours) {
              bucket.count += 1
              break
            }
          }
        }
      })

      return responseBuckets.map((bucket) => ({
        responseTime: bucket.label,
        count: bucket.count,
      }))
    } catch (error) {
      console.error("Error fetching feedback response times:", error)
      throw error
    }
  }
}

export const feedbackAnalyticsService = new FeedbackAnalyticsService()
