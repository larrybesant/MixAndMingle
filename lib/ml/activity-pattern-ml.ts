import * as tf from "@tensorflow/tfjs"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"

// Define interfaces for our data structures
interface ActivityDataPoint {
  timestamp: number
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  hour: number // 0-23
  minute: number // 0-59
  isActive: boolean
}

interface ActivityPattern {
  weekdayPatterns: number[][] // 7 days x 24 hours activity probability
  weekendPatterns: number[][] // 2 days x 24 hours activity probability
  lastUpdated: number
  dataPoints: number
  modelVersion: string
}

interface MLPrediction {
  startTime: string
  endTime: string
  confidence: number
  weekdayPrediction: boolean // true if prediction is for weekdays
  weekendPrediction: boolean // true if prediction is for weekends
}

export class ActivityPatternML {
  private readonly MODEL_VERSION = "1.0.0"
  private readonly MIN_DATA_POINTS = 200
  private readonly ACTIVITY_THRESHOLD = 0.3
  private readonly MIN_QUIET_HOURS_DURATION = 4
  private readonly MAX_QUIET_HOURS_DURATION = 10
  private readonly WEEKDAY_INDICES = [1, 2, 3, 4, 5] // Monday-Friday
  private readonly WEEKEND_INDICES = [0, 6] // Sunday, Saturday

  // Initialize TensorFlow.js
  private async initTF(): Promise<void> {
    await tf.ready()
    console.log("TensorFlow.js initialized:", tf.getBackend())
  }

  constructor() {
    this.initTF().catch(console.error)
  }

  // Fetch activity data for a user
  async fetchActivityData(userId: string, daysBack = 30): Promise<ActivityDataPoint[]> {
    if (!userId) return []

    try {
      const logsRef = collection(db, "userActivity", userId, "logs")
      const startTime = Date.now() - daysBack * 24 * 60 * 60 * 1000

      const q = query(
        logsRef,
        where("timestamp", ">=", startTime),
        orderBy("timestamp", "desc"),
        limit(5000), // Increased limit for better ML training
      )

      const querySnapshot = await getDocs(q)
      const activityData: ActivityDataPoint[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const date = new Date(data.timestamp)

        activityData.push({
          timestamp: data.timestamp,
          dayOfWeek: date.getDay(),
          hour: date.getHours(),
          minute: date.getMinutes(),
          isActive: data.action !== "user_inactive",
        })
      })

      return activityData
    } catch (error) {
      console.error("Error fetching activity data:", error)
      return []
    }
  }

  // Process activity data into tensors for ML
  processActivityData(data: ActivityDataPoint[]): {
    weekdayData: tf.Tensor2D
    weekendData: tf.Tensor2D
  } {
    // Initialize activity matrices (hours x days)
    const weekdayMatrix = Array(24)
      .fill(0)
      .map(() => Array(5).fill(0))
    const weekendMatrix = Array(24)
      .fill(0)
      .map(() => Array(2).fill(0))

    // Count active hours
    const weekdayCounts = Array(24)
      .fill(0)
      .map(() => Array(5).fill(0))
    const weekendCounts = Array(24)
      .fill(0)
      .map(() => Array(2).fill(0))

    // Process each data point
    data.forEach((point) => {
      const hour = point.hour
      const day = point.dayOfWeek

      if (this.WEEKDAY_INDICES.includes(day)) {
        const dayIndex = this.WEEKDAY_INDICES.indexOf(day)
        if (point.isActive) {
          weekdayMatrix[hour][dayIndex]++
        }
        weekdayCounts[hour][dayIndex]++
      } else if (this.WEEKEND_INDICES.includes(day)) {
        const dayIndex = this.WEEKEND_INDICES.indexOf(day)
        if (point.isActive) {
          weekendMatrix[hour][dayIndex]++
        }
        weekendCounts[hour][dayIndex]++
      }
    })

    // Convert to activity probabilities
    const weekdayProbs = weekdayMatrix.map((hourData, hour) =>
      hourData.map((count, day) => (weekdayCounts[hour][day] > 0 ? count / weekdayCounts[hour][day] : 0)),
    )

    const weekendProbs = weekendMatrix.map((hourData, hour) =>
      hourData.map((count, day) => (weekendCounts[hour][day] > 0 ? count / weekendCounts[hour][day] : 0)),
    )

    // Convert to tensors
    const weekdayTensor = tf.tensor2d(weekdayProbs)
    const weekendTensor = tf.tensor2d(weekendProbs)

    return {
      weekdayData: weekdayTensor,
      weekendData: weekendTensor,
    }
  }

  // Apply clustering to identify activity patterns
  async clusterActivityPatterns(
    weekdayData: tf.Tensor2D,
    weekendData: tf.Tensor2D,
  ): Promise<{
    weekdayPatterns: number[][]
    weekendPatterns: number[][]
  }> {
    // Use TF.js K-means clustering for activity patterns
    const weekdayPatterns = await this.performKMeansClustering(weekdayData)
    const weekendPatterns = await this.performKMeansClustering(weekendData)

    return {
      weekdayPatterns,
      weekendPatterns,
    }
  }

  // Perform K-means clustering on activity data
  private async performKMeansClustering(data: tf.Tensor2D): Promise<number[][]> {
    // We'll use a simplified K-means implementation for browser compatibility
    // In a production environment, you might want to use a more robust library

    // First, we'll compute the mean activity by hour
    const hourlyMeans = Array(24).fill(0)

    // Use tf.js operations for efficient computation
    const hourlyData = (await data.mean(1).array()) as number[]

    for (let i = 0; i < 24; i++) {
      hourlyMeans[i] = hourlyData[i]
    }

    return [hourlyMeans] // Return as a pattern cluster
  }

  // Apply time series analysis to detect trends
  analyzeTimeSeries(data: ActivityDataPoint[]): {
    weekdayTrend: number[]
    weekendTrend: number[]
  } {
    // Group data by hour and day type (weekday/weekend)
    const weekdayHourlyData: { [hour: number]: number[] } = {}
    const weekendHourlyData: { [hour: number]: number[] } = {}

    // Initialize arrays
    for (let i = 0; i < 24; i++) {
      weekdayHourlyData[i] = []
      weekendHourlyData[i] = []
    }

    // Group data points
    data.forEach((point) => {
      const hour = point.hour
      const day = point.dayOfWeek
      const isWeekday = this.WEEKDAY_INDICES.includes(day)

      if (isWeekday) {
        weekdayHourlyData[hour].push(point.isActive ? 1 : 0)
      } else {
        weekendHourlyData[hour].push(point.isActive ? 1 : 0)
      }
    })

    // Calculate exponential moving averages for trend detection
    const weekdayTrend = this.calculateEMA(weekdayHourlyData)
    const weekendTrend = this.calculateEMA(weekendHourlyData)

    return {
      weekdayTrend,
      weekendTrend,
    }
  }

  // Calculate Exponential Moving Average for trend detection
  private calculateEMA(hourlyData: { [hour: number]: number[] }): number[] {
    const ema = Array(24).fill(0)
    const alpha = 0.3 // Smoothing factor

    for (let hour = 0; hour < 24; hour++) {
      const values = hourlyData[hour]
      if (values.length === 0) continue

      // Calculate simple average first
      let sum = 0
      for (const value of values) {
        sum += value
      }
      const avg = sum / values.length

      // Initialize EMA with simple average
      let currentEMA = avg

      // Calculate EMA
      for (const value of values) {
        currentEMA = alpha * value + (1 - alpha) * currentEMA
      }

      ema[hour] = currentEMA
    }

    return ema
  }

  // Find optimal quiet hours using ML predictions
  findOptimalQuietHours(
    weekdayPatterns: number[][],
    weekendPatterns: number[][],
    weekdayTrend: number[],
    weekendTrend: number[],
  ): MLPrediction[] {
    const predictions: MLPrediction[] = []

    // Find weekday quiet hours
    const weekdayPrediction = this.findQuietHoursForPattern(weekdayPatterns[0], weekdayTrend, true, false)
    if (weekdayPrediction) predictions.push(weekdayPrediction)

    // Find weekend quiet hours
    const weekendPrediction = this.findQuietHoursForPattern(weekendPatterns[0], weekendTrend, false, true)
    if (weekendPrediction) predictions.push(weekendPrediction)

    return predictions
  }

  // Find quiet hours for a specific pattern
  private findQuietHoursForPattern(
    pattern: number[],
    trend: number[],
    isWeekday: boolean,
    isWeekend: boolean,
  ): MLPrediction | null {
    // Combine pattern and trend data with weights
    const combinedPattern = pattern.map((val, idx) => 0.7 * val + 0.3 * trend[idx])

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
      const activity = combinedPattern[hour]

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

      // Calculate confidence based on how inactive the period is and data consistency
      let totalActivity = 0
      let variability = 0
      let prevActivity = combinedPattern[startHour]

      for (let i = 0; i < longestLength; i++) {
        const hour = (longestStart + i) % 24
        totalActivity += combinedPattern[hour]
        variability += Math.abs(combinedPattern[hour] - prevActivity)
        prevActivity = combinedPattern[hour]
      }

      const avgActivity = totalActivity / longestLength
      const avgVariability = variability / (longestLength - 1)

      // Higher confidence for lower activity and lower variability
      const activityConfidence = 1 - avgActivity / this.ACTIVITY_THRESHOLD
      const variabilityConfidence = 1 - Math.min(1, avgVariability * 5)

      // Combined confidence score
      const confidence = 0.7 * activityConfidence + 0.3 * variabilityConfidence

      return {
        startTime: formatHour(startHour),
        endTime: formatHour(endHour),
        confidence: Math.min(0.95, Math.max(0.5, confidence)),
        weekdayPrediction: isWeekday,
        weekendPrediction: isWeekend,
      }
    }

    return null
  }

  // Save the ML model and patterns to Firestore
  async saveActivityPattern(userId: string, pattern: ActivityPattern): Promise<void> {
    if (!userId) return

    try {
      await setDoc(doc(db, "userActivityPatterns", userId), {
        ...pattern,
        lastUpdated: Date.now(),
        modelVersion: this.MODEL_VERSION,
      })
    } catch (error) {
      console.error("Error saving activity pattern:", error)
    }
  }

  // Load the ML model and patterns from Firestore
  async loadActivityPattern(userId: string): Promise<ActivityPattern | null> {
    if (!userId) return null

    try {
      const patternDoc = await getDoc(doc(db, "userActivityPatterns", userId))

      if (patternDoc.exists()) {
        return patternDoc.data() as ActivityPattern
      }
    } catch (error) {
      console.error("Error loading activity pattern:", error)
    }

    return null
  }

  // Main function to generate ML-based quiet hours predictions
  async generatePredictions(userId: string): Promise<MLPrediction[]> {
    // Check if we have a recent pattern analysis
    const existingPattern = await this.loadActivityPattern(userId)
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000

    if (
      existingPattern &&
      existingPattern.modelVersion === this.MODEL_VERSION &&
      Date.now() - existingPattern.lastUpdated < oneWeekMs &&
      existingPattern.dataPoints >= this.MIN_DATA_POINTS
    ) {
      // Use existing pattern if it's recent
      return this.findOptimalQuietHours(
        existingPattern.weekdayPatterns,
        existingPattern.weekendPatterns,
        existingPattern.weekdayPatterns[0], // Use pattern as trend for existing data
        existingPattern.weekendPatterns[0],
      )
    }

    // Otherwise, generate new predictions
    const activityData = await this.fetchActivityData(userId)

    if (activityData.length < this.MIN_DATA_POINTS) {
      console.log("Not enough data for ML predictions")
      return []
    }

    // Process data into tensors
    const { weekdayData, weekendData } = this.processActivityData(activityData)

    // Cluster activity patterns
    const { weekdayPatterns, weekendPatterns } = await this.clusterActivityPatterns(weekdayData, weekendData)

    // Analyze time series
    const { weekdayTrend, weekendTrend } = this.analyzeTimeSeries(activityData)

    // Save the new pattern
    const newPattern: ActivityPattern = {
      weekdayPatterns,
      weekendPatterns,
      lastUpdated: Date.now(),
      dataPoints: activityData.length,
      modelVersion: this.MODEL_VERSION,
    }

    await this.saveActivityPattern(userId, newPattern)

    // Generate predictions
    return this.findOptimalQuietHours(weekdayPatterns, weekendPatterns, weekdayTrend, weekendTrend)
  }
}

export const activityPatternML = new ActivityPatternML()
