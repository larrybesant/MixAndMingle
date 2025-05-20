import * as admin from "firebase-admin"
import { getFirestore } from "@/lib/firebase-admin"

interface WeeklyReport {
  metrics: {
    totalTesters: number
    activeTesters: number
    newTesters: number
    totalFeedback: number
    newFeedback: number
    bugReports: number
    suggestions: number
    generalFeedback: number
    averageTasksCompleted: number
    completionRate: number
  }
  engagement: {
    dailyActiveUsers: { date: string; count: number }[]
    averageSessionTime: number
    totalSessions: number
  }
  feedback: {
    topFeedbackItems: {
      id: string
      type: string
      title: string
      votes: number
      status: string
    }[]
    feedbackByCategory: Record<string, number>
  }
  tasks: {
    taskCompletionRates: { taskId: string; taskName: string; completionRate: number }[]
  }
  retention: {
    weeklyRetentionRate: number
    previousWeekRetentionRate: number
    retentionChange: number
  }
  summary: {
    highlights: string[]
    concerns: string[]
    recommendations: string[]
  }
}

export async function generateWeeklyReport(startDate: Date, endDate: Date): Promise<WeeklyReport> {
  const db = getFirestore()

  // Convert dates to Firestore timestamps
  const startTimestamp = admin.firestore.Timestamp.fromDate(startDate)
  const endTimestamp = admin.firestore.Timestamp.fromDate(endDate)

  // Previous week date range for comparison
  const previousStartDate = new Date(startDate)
  previousStartDate.setDate(previousStartDate.getDate() - 7)
  const previousEndDate = new Date(endDate)
  previousEndDate.setDate(previousEndDate.getDate() - 7)
  const previousStartTimestamp = admin.firestore.Timestamp.fromDate(previousStartDate)
  const previousEndTimestamp = admin.firestore.Timestamp.fromDate(previousEndDate)

  // Fetch users with beta tester role
  const usersSnapshot = await db.collection("users").where("role", "==", "beta_tester").get()

  // Fetch new testers who joined during this period
  const newTestersSnapshot = await db
    .collection("users")
    .where("role", "==", "beta_tester")
    .where("createdAt", ">=", startTimestamp)
    .where("createdAt", "<=", endTimestamp)
    .get()

  // Fetch active testers during this period
  const activeTestersSnapshot = await db
    .collection("userActivity")
    .where("lastActive", ">=", startTimestamp)
    .where("lastActive", "<=", endTimestamp)
    .get()

  // Get unique active user IDs
  const activeUserIds = new Set<string>()
  activeTestersSnapshot.forEach((doc) => {
    activeUserIds.add(doc.id)
  })

  // Fetch feedback submitted during this period
  const feedbackSnapshot = await db
    .collection("betaFeedback")
    .where("createdAt", ">=", startTimestamp)
    .where("createdAt", "<=", endTimestamp)
    .get()

  // Fetch top voted feedback
  const topFeedbackSnapshot = await db.collection("betaFeedback").orderBy("votes", "desc").limit(5).get()

  // Fetch task completion data
  const tasksSnapshot = await db.collection("betaTasks").get()
  const taskCompletionRates: { taskId: string; taskName: string; completionRate: number }[] = []

  // Process task completion data
  for (const taskDoc of tasksSnapshot.docs) {
    const taskData = taskDoc.data()
    const taskId = taskDoc.id

    // Count completions for this task
    const completionsSnapshot = await db.collection("betaTaskCompletions").where("taskId", "==", taskId).get()

    const completionRate = (completionsSnapshot.size / usersSnapshot.size) * 100

    taskCompletionRates.push({
      taskId,
      taskName: taskData.title || `Task ${taskId}`,
      completionRate,
    })
  }

  // Calculate metrics
  let bugReports = 0
  let suggestions = 0
  let generalFeedback = 0
  let totalTasksCompleted = 0

  // Process feedback by type
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

  // Calculate task completion metrics
  usersSnapshot.forEach((doc) => {
    const userData = doc.data()
    totalTasksCompleted += userData.betaStatus?.tasksCompleted || 0
  })

  const averageTasksCompleted = usersSnapshot.size > 0 ? totalTasksCompleted / usersSnapshot.size : 0
  const completionRate = usersSnapshot.size > 0 ? (activeUserIds.size / usersSnapshot.size) * 100 : 0

  // Generate daily active users data
  const dailyActiveUsers: { date: string; count: number }[] = []

  // Create a map for each day in the date range
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split("T")[0]
    dailyActiveUsers.push({
      date: dateString,
      count: 0,
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Count active users per day
  activeTestersSnapshot.forEach((doc) => {
    const userData = doc.data()
    if (userData.lastActive) {
      const activeDate = userData.lastActive.toDate().toISOString().split("T")[0]
      const dayEntry = dailyActiveUsers.find((day) => day.date === activeDate)
      if (dayEntry) {
        dayEntry.count++
      }
    }
  })

  // Calculate retention rate
  // Get users active in previous week
  const previousActiveSnapshot = await db
    .collection("userActivity")
    .where("lastActive", ">=", previousStartTimestamp)
    .where("lastActive", "<=", previousEndTimestamp)
    .get()

  const previousActiveUserIds = new Set<string>()
  previousActiveSnapshot.forEach((doc) => {
    previousActiveUserIds.add(doc.id)
  })

  // Count returning users (active in both weeks)
  let returningUsers = 0
  activeUserIds.forEach((userId) => {
    if (previousActiveUserIds.has(userId)) {
      returningUsers++
    }
  })

  const weeklyRetentionRate = previousActiveUserIds.size > 0 ? (returningUsers / previousActiveUserIds.size) * 100 : 0

  // Get retention rate from two weeks ago for comparison
  const twoWeeksAgoStart = new Date(previousStartDate)
  twoWeeksAgoStart.setDate(twoWeeksAgoStart.getDate() - 7)
  const twoWeeksAgoEnd = new Date(previousEndDate)
  twoWeeksAgoEnd.setDate(twoWeeksAgoEnd.getDate() - 7)

  // This would require additional queries to calculate accurately
  // For simplicity, we'll use a placeholder value
  const previousWeekRetentionRate = 0 // In a real implementation, calculate this
  const retentionChange = weeklyRetentionRate - previousWeekRetentionRate

  // Process top feedback
  const topFeedbackItems: {
    id: string
    type: string
    title: string
    votes: number
    status: string
  }[] = []

  topFeedbackSnapshot.forEach((doc) => {
    const feedbackData = doc.data()
    topFeedbackItems.push({
      id: doc.id,
      type: feedbackData.type || "general",
      title: feedbackData.title || "Untitled Feedback",
      votes: feedbackData.votes || 0,
      status: feedbackData.status || "pending",
    })
  })

  // Calculate feedback by category
  const feedbackByCategory: Record<string, number> = {
    "UI/UX": 0,
    Performance: 0,
    Features: 0,
    "Audio/Video": 0,
    Other: 0,
  }

  feedbackSnapshot.forEach((doc) => {
    const feedbackData = doc.data()
    const category = feedbackData.category || "Other"
    if (feedbackByCategory[category] !== undefined) {
      feedbackByCategory[category]++
    } else {
      feedbackByCategory["Other"]++
    }
  })

  // Generate insights
  const highlights: string[] = []
  const concerns: string[] = []
  const recommendations: string[] = []

  // Add some example insights based on the data
  if (newTestersSnapshot.size > 0) {
    highlights.push(`${newTestersSnapshot.size} new beta testers joined this week.`)
  }

  if (feedbackSnapshot.size > 5) {
    highlights.push(`Received ${feedbackSnapshot.size} new feedback items this week.`)
  }

  if (bugReports > 0) {
    concerns.push(`${bugReports} new bug reports were submitted this week.`)
  }

  if (completionRate < 50) {
    concerns.push(`Task completion rate is low at ${completionRate.toFixed(1)}%.`)
    recommendations.push("Consider simplifying beta tasks or providing clearer instructions.")
  }

  if (weeklyRetentionRate < 70) {
    concerns.push(`Weekly retention rate is ${weeklyRetentionRate.toFixed(1)}%, which is below target.`)
    recommendations.push("Implement engagement strategies to keep beta testers returning.")
  }

  // Add generic recommendations if we don't have enough
  if (recommendations.length < 2) {
    recommendations.push("Follow up with testers who submitted valuable feedback.")
    recommendations.push("Consider adding new beta tasks to test recent feature additions.")
  }

  return {
    metrics: {
      totalTesters: usersSnapshot.size,
      activeTesters: activeUserIds.size,
      newTesters: newTestersSnapshot.size,
      totalFeedback: feedbackSnapshot.size,
      newFeedback: feedbackSnapshot.size,
      bugReports,
      suggestions,
      generalFeedback,
      averageTasksCompleted,
      completionRate,
    },
    engagement: {
      dailyActiveUsers,
      averageSessionTime: 15, // Placeholder - would need session data
      totalSessions: activeUserIds.size * 3, // Rough estimate
    },
    feedback: {
      topFeedbackItems,
      feedbackByCategory,
    },
    tasks: {
      taskCompletionRates,
    },
    retention: {
      weeklyRetentionRate,
      previousWeekRetentionRate,
      retentionChange,
    },
    summary: {
      highlights,
      concerns,
      recommendations,
    },
  }
}
