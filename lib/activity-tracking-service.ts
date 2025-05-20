import { doc, getDoc, setDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Define the structure of an activity log entry
interface ActivityLogEntry {
  timestamp: number // Unix timestamp in milliseconds
  action: string // e.g., 'login', 'message_sent', 'page_view', etc.
  metadata?: Record<string, any> // Additional context about the activity
}

// Define the structure of activity summary
interface ActivitySummary {
  hourlyActivity: number[] // 24 elements, one for each hour, representing activity level
  lastUpdated: number // Unix timestamp in milliseconds
  dataPoints: number // Number of data points used to generate this summary
}

// Define the structure of quiet hours suggestion
export interface QuietHoursSuggestion {
  startTime: string // 24-hour format, e.g., "22:00"
  endTime: string // 24-hour format, e.g., "07:00"
  confidence: number // 0-1, how confident we are in this suggestion
  reason: string // Human-readable explanation for the suggestion
}

class ActivityTrackingService {
  private readonly ACTIVITY_LOG_LIMIT = 1000 // Maximum number of activity logs to keep
  private readonly ACTIVITY_SUMMARY_DAYS = 14 // Number of days to analyze for patterns
  private readonly MIN_DATA_POINTS = 100 // Minimum data points needed for reliable suggestions
  private readonly ACTIVITY_THRESHOLD = 0.2 // Activity level below this is considered "inactive"
  private readonly MIN_QUIET_HOURS_DURATION = 4 // Minimum duration for quiet hours in hours
  private readonly MAX_QUIET_HOURS_DURATION = 10 // Maximum duration for quiet hours in hours

  // Log a user activity
  async logActivity(userId: string, action: string, metadata?: Record<string, any>): Promise<void> {
    if (!userId) return

    try {
      const activityRef = collection(db, "userActivity", userId, "logs")
      const entry: ActivityLogEntry = {
        timestamp: Date.now(),
        action,
        metadata,
      }

      // Add the activity log
      await setDoc(doc(activityRef), entry)

      // Periodically update the activity summary
      await this.updateActivitySummaryIfNeeded(userId)
    } catch (error) {
      console.error("Error logging activity:", error)
    }
  }

  // Update the activity summary if it's outdated
  private async updateActivitySummaryIfNeeded(userId: string): Promise<void> {
    try {
      const summaryRef = doc(db, "userActivity", userId)
      const summaryDoc = await getDoc(summaryRef)

      const now = Date.now()
      const oneDayMs = 24 * 60 * 60 * 1000

      // If summary doesn't exist or is older than a day, update it
      if (!summaryDoc.exists() || now - summaryDoc.data()?.lastUpdated > oneDayMs) {
        await this.generateActivitySummary(userId)
      }
    } catch (error) {
      console.error("Error checking activity summary:", error)
    }
  }

  // Generate an activity summary based on recent logs
  private async generateActivitySummary(userId: string): Promise<void> {
    try {
      const logsRef = collection(db, "userActivity", userId, "logs")
      const startTime = Date.now() - this.ACTIVITY_SUMMARY_DAYS * 24 * 60 * 60 * 1000

      // Query recent activity logs
      const q = query(
        logsRef,
        where("timestamp", ">=", startTime),
        orderBy("timestamp", "desc"),
        limit(this.ACTIVITY_LOG_LIMIT),
      )

      const querySnapshot = await getDocs(q)
      const logs: ActivityLogEntry[] = []

      querySnapshot.forEach((doc) => {
        logs.push(doc.data() as ActivityLogEntry)
      })

      // Initialize hourly activity counters
      const hourlyActivity = Array(24).fill(0)

      // Count activities by hour
      logs.forEach((log) => {
        const hour = new Date(log.timestamp).getHours()
        hourlyActivity[hour]++
      })

      // Normalize the hourly activity (0-1 scale)
      const maxActivity = Math.max(...hourlyActivity)
      const normalizedActivity = hourlyActivity.map((count) => (maxActivity > 0 ? count / maxActivity : 0))

      // Create the activity summary
      const summary: ActivitySummary = {
        hourlyActivity: normalizedActivity,
        lastUpdated: Date.now(),
        dataPoints: logs.length,
      }

      // Save the summary
      await setDoc(doc(db, "userActivity", userId), summary)
    } catch (error) {
      console.error("Error generating activity summary:", error)
    }
  }

  // Get the activity summary for a user
  async getActivitySummary(userId: string): Promise<ActivitySummary | null> {
    if (!userId) return null

    try {
      const summaryRef = doc(db, "userActivity", userId)
      const summaryDoc = await getDoc(summaryRef)

      if (summaryDoc.exists()) {
        return summaryDoc.data() as ActivitySummary
      } else {
        // Generate a new summary if one doesn't exist
        await this.generateActivitySummary(userId)
        const newSummaryDoc = await getDoc(summaryRef)
        return newSummaryDoc.exists() ? (newSummaryDoc.data() as ActivitySummary) : null
      }
    } catch (error) {
      console.error("Error getting activity summary:", error)
      return null
    }
  }

  // Suggest quiet hours based on activity patterns
  async suggestQuietHours(userId: string): Promise<QuietHoursSuggestion | null> {
    const summary = await this.getActivitySummary(userId)
    if (!summary || summary.dataPoints < this.MIN_DATA_POINTS) {
      return null
    }

    const { hourlyActivity } = summary

    // Find the longest continuous period of low activity
    let longestStart = -1
    let longestLength = 0
    let currentStart = -1
    let currentLength = 0

    // Helper function to format hour as HH:00
    const formatHour = (hour: number) => `${hour.toString().padStart(2, "0")}:00`

    // Scan through the hours twice to handle periods that wrap around midnight
    for (let i = 0; i < 48; i++) {
      const hour = i % 24
      const activity = hourlyActivity[hour]

      if (activity <= this.ACTIVITY_THRESHOLD) {
        // Low activity hour
        if (currentStart === -1) {
          currentStart = hour
          currentLength = 1
        } else {
          currentLength++
        }
      } else {
        // High activity hour
        if (currentLength > longestLength && currentLength >= this.MIN_QUIET_HOURS_DURATION) {
          longestStart = currentStart
          longestLength = currentLength
        }
        currentStart = -1
        currentLength = 0
      }
    }

    // Check one more time after the loop
    if (currentLength > longestLength && currentLength >= this.MIN_QUIET_HOURS_DURATION) {
      longestStart = currentStart
      longestLength = currentLength
    }

    // Cap the duration if it's too long
    if (longestLength > this.MAX_QUIET_HOURS_DURATION) {
      longestLength = this.MAX_QUIET_HOURS_DURATION
    }

    // If we found a suitable period
    if (longestStart !== -1 && longestLength >= this.MIN_QUIET_HOURS_DURATION) {
      const startHour = longestStart
      const endHour = (longestStart + longestLength) % 24

      // Calculate confidence based on how inactive the period is
      let totalActivity = 0
      for (let i = 0; i < longestLength; i++) {
        const hour = (longestStart + i) % 24
        totalActivity += hourlyActivity[hour]
      }
      const avgActivity = totalActivity / longestLength
      const confidence = 1 - avgActivity / this.ACTIVITY_THRESHOLD

      return {
        startTime: formatHour(startHour),
        endTime: formatHour(endHour),
        confidence: Math.min(0.95, Math.max(0.5, confidence)), // Clamp between 0.5 and 0.95
        reason: this.generateReason(startHour, endHour, longestLength, confidence),
      }
    }

    return null
  }

  // Generate a human-readable reason for the suggestion
  private generateReason(startHour: number, endHour: number, duration: number, confidence: number): string {
    const confidenceText = confidence > 0.8 ? "very low" : confidence > 0.6 ? "low" : "relatively low"

    if (startHour > 18 || startHour < 6) {
      // Night-time quiet hours
      return `You typically have ${confidenceText} activity between ${this.formatHourAmPm(startHour)} and ${this.formatHourAmPm(endHour)}, which suggests this might be when you're sleeping or resting.`
    } else {
      // Daytime quiet hours
      return `You typically have ${confidenceText} activity for about ${duration} hours starting at ${this.formatHourAmPm(startHour)}, which might be a good time to mute notifications.`
    }
  }

  // Format hour in 12-hour AM/PM format
  private formatHourAmPm(hour: number): string {
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12} ${ampm}`
  }

  // Clean up old activity logs
  async cleanupOldLogs(userId: string): Promise<void> {
    if (!userId) return

    try {
      const logsRef = collection(db, "userActivity", userId, "logs")
      const cutoffTime = Date.now() - this.ACTIVITY_SUMMARY_DAYS * 24 * 60 * 60 * 1000

      const q = query(logsRef, where("timestamp", "<", cutoffTime), limit(100))
      const querySnapshot = await getDocs(q)

      const batch = db.batch()
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })

      if (querySnapshot.size > 0) {
        await batch.commit()
      }
    } catch (error) {
      console.error("Error cleaning up old activity logs:", error)
    }
  }
}

export const activityTrackingService = new ActivityTrackingService()
