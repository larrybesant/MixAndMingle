import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, arrayUnion, increment, collection, query, where, getDocs } from "firebase/firestore"
import { notificationService } from "@/lib/notification-service"

// Badge types
export type BadgeCategory = "feedback" | "testing" | "social" | "technical" | "community" | "achievement" | "challenge"

// Badge interface
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: BadgeCategory
  points: number
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  dateAwarded?: string
}

// Available badges
export const BADGES: Badge[] = [
  // Feedback badges
  {
    id: "first_feedback",
    name: "First Insight",
    description: "Submitted your first feedback",
    icon: "message-square",
    category: "feedback",
    points: 10,
    rarity: "common",
  },
  {
    id: "feedback_5",
    name: "Valuable Input",
    description: "Submitted 5 pieces of feedback",
    icon: "message-circle",
    category: "feedback",
    points: 25,
    rarity: "uncommon",
  },
  {
    id: "feedback_20",
    name: "Feedback Maven",
    description: "Submitted 20 pieces of feedback",
    icon: "message-square-plus",
    category: "feedback",
    points: 100,
    rarity: "rare",
  },
  {
    id: "bug_hunter",
    name: "Bug Hunter",
    description: "Reported 5 bugs that were confirmed",
    icon: "bug",
    category: "feedback",
    points: 150,
    rarity: "rare",
  },
  {
    id: "idea_machine",
    name: "Idea Machine",
    description: "Submitted 10 feature suggestions",
    icon: "lightbulb",
    category: "feedback",
    points: 75,
    rarity: "uncommon",
  },

  // Testing badges
  {
    id: "first_task",
    name: "First Steps",
    description: "Completed your first beta task",
    icon: "check-circle",
    category: "testing",
    points: 10,
    rarity: "common",
  },
  {
    id: "task_master",
    name: "Task Master",
    description: "Completed all beta tasks",
    icon: "check-circle-2",
    category: "testing",
    points: 200,
    rarity: "epic",
  },
  {
    id: "video_tester",
    name: "Video Pioneer",
    description: "Tested video rooms extensively",
    icon: "video",
    category: "testing",
    points: 50,
    rarity: "uncommon",
  },
  {
    id: "chat_enthusiast",
    name: "Chat Enthusiast",
    description: "Participated in 10 different chat rooms",
    icon: "message-square-heart",
    category: "testing",
    points: 50,
    rarity: "uncommon",
  },
  {
    id: "dj_fan",
    name: "DJ Fan",
    description: "Spent over 2 hours in DJ rooms",
    icon: "music",
    category: "testing",
    points: 75,
    rarity: "uncommon",
  },

  // Social badges
  {
    id: "social_butterfly",
    name: "Social Butterfly",
    description: "Connected with 10 other beta testers",
    icon: "users",
    category: "social",
    points: 100,
    rarity: "rare",
  },
  {
    id: "gift_giver",
    name: "Gift Giver",
    description: "Sent virtual gifts to 5 different users",
    icon: "gift",
    category: "social",
    points: 75,
    rarity: "uncommon",
  },
  {
    id: "conversation_starter",
    name: "Conversation Starter",
    description: "Started 5 active chat rooms",
    icon: "message-square-plus",
    category: "social",
    points: 50,
    rarity: "uncommon",
  },

  // Technical badges
  {
    id: "device_tester",
    name: "Device Tester",
    description: "Tested on 3+ different devices",
    icon: "smartphone",
    category: "technical",
    points: 100,
    rarity: "rare",
  },
  {
    id: "browser_tester",
    name: "Browser Tester",
    description: "Tested on 3+ different browsers",
    icon: "globe",
    category: "technical",
    points: 75,
    rarity: "uncommon",
  },
  {
    id: "network_tester",
    name: "Network Tester",
    description: "Tested under various network conditions",
    icon: "wifi",
    category: "technical",
    points: 125,
    rarity: "rare",
  },

  // Community badges
  {
    id: "first_vote",
    name: "First Vote",
    description: "Voted on your first feedback item",
    icon: "vote",
    category: "community",
    points: 5,
    rarity: "common",
  },
  {
    id: "helpful_voter",
    name: "Helpful Voter",
    description: "Voted on 20+ feedback items",
    icon: "thumbs-up",
    category: "community",
    points: 50,
    rarity: "uncommon",
  },
  {
    id: "super_voter",
    name: "Super Voter",
    description: "Voted on 50+ feedback items",
    icon: "award",
    category: "community",
    points: 100,
    rarity: "rare",
  },
  {
    id: "top_voted",
    name: "Community Favorite",
    description: "Received 10+ upvotes on your feedback",
    icon: "award",
    category: "community",
    points: 150,
    rarity: "rare",
  },
  {
    id: "community_favorite",
    name: "Community Star",
    description: "Received 50+ upvotes across all your feedback",
    icon: "star",
    category: "community",
    points: 250,
    rarity: "epic",
  },
  {
    id: "beta_recruiter",
    name: "Beta Recruiter",
    description: "Invited 3+ friends who joined the beta",
    icon: "user-plus",
    category: "community",
    points: 200,
    rarity: "epic",
  },

  // Challenge badges
  {
    id: "first_challenge",
    name: "Challenge Accepted",
    description: "Completed your first daily challenge",
    icon: "target",
    category: "challenge",
    points: 10,
    rarity: "common",
  },
  {
    id: "challenge_enthusiast",
    name: "Challenge Enthusiast",
    description: "Completed 10 daily challenges",
    icon: "zap",
    category: "challenge",
    points: 50,
    rarity: "uncommon",
  },
  {
    id: "challenge_master",
    name: "Challenge Master",
    description: "Completed 30 daily challenges",
    icon: "award",
    category: "challenge",
    points: 100,
    rarity: "rare",
  },
  {
    id: "three_day_streak",
    name: "On Fire",
    description: "Completed challenges for 3 days in a row",
    icon: "flame",
    category: "challenge",
    points: 25,
    rarity: "uncommon",
  },
  {
    id: "weekly_streak",
    name: "Weekly Warrior",
    description: "Completed challenges for 7 days in a row",
    icon: "calendar",
    category: "challenge",
    points: 75,
    rarity: "rare",
  },
  {
    id: "monthly_streak",
    name: "Challenge Champion",
    description: "Completed challenges for 30 days in a row",
    icon: "trophy",
    category: "challenge",
    points: 250,
    rarity: "legendary",
  },

  // Achievement badges
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Joined in the first week of beta",
    icon: "clock",
    category: "achievement",
    points: 100,
    rarity: "rare",
  },
  {
    id: "beta_veteran",
    name: "Beta Veteran",
    description: "Active for 30+ days in the beta",
    icon: "shield",
    category: "achievement",
    points: 150,
    rarity: "rare",
  },
  {
    id: "beta_legend",
    name: "Beta Legend",
    description: "Earned 10+ other badges",
    icon: "crown",
    category: "achievement",
    points: 300,
    rarity: "legendary",
  },
]

// Badge service
class BadgeService {
  // Award a badge to a user
  async awardBadge(userId: string, badgeId: string): Promise<boolean> {
    try {
      // Get user document
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        console.error(`User ${userId} not found`)
        return false
      }

      const userData = userDoc.data()
      const userBadges = userData.badges || []

      // Check if user already has this badge
      if (userBadges.some((badge: any) => badge.id === badgeId)) {
        return false
      }

      // Find badge details
      const badge = BADGES.find((b) => b.id === badgeId)

      if (!badge) {
        console.error(`Badge ${badgeId} not found`)
        return false
      }

      // Add badge with award date
      const badgeWithDate = {
        ...badge,
        dateAwarded: new Date().toISOString(),
      }

      // Update user document
      await updateDoc(userRef, {
        badges: arrayUnion(badgeWithDate),
        gamificationPoints: increment(badge.points),
      })

      // Send notification
      await notificationService.createNotification({
        userId,
        type: "system",
        title: "New Badge Earned!",
        body: `You've earned the "${badge.name}" badge: ${badge.description}`,
        image: `/badges/${badge.id}.png`,
        data: {
          badgeId,
          points: badge.points,
        },
      })

      return true
    } catch (error) {
      console.error("Error awarding badge:", error)
      return false
    }
  }

  // Check and award feedback badges
  async checkFeedbackBadges(userId: string): Promise<string[]> {
    try {
      const awardedBadges: string[] = []

      // Get user's feedback count
      const feedbackQuery = query(collection(db, "betaFeedback"), where("userId", "==", userId))

      const feedbackDocs = await getDocs(feedbackQuery)
      const feedbackCount = feedbackDocs.size

      // Get bug report count
      const bugReportQuery = query(
        collection(db, "betaFeedback"),
        where("userId", "==", userId),
        where("type", "==", "bug"),
        where("status", "==", "confirmed"),
      )

      const bugReportDocs = await getDocs(bugReportQuery)
      const bugReportCount = bugReportDocs.size

      // Get suggestion count
      const suggestionQuery = query(
        collection(db, "betaFeedback"),
        where("userId", "==", userId),
        where("type", "==", "suggestion"),
      )

      const suggestionDocs = await getDocs(suggestionQuery)
      const suggestionCount = suggestionDocs.size

      // Check for first feedback badge
      if (feedbackCount >= 1) {
        const awarded = await this.awardBadge(userId, "first_feedback")
        if (awarded) awardedBadges.push("first_feedback")
      }

      // Check for 5 feedback badge
      if (feedbackCount >= 5) {
        const awarded = await this.awardBadge(userId, "feedback_5")
        if (awarded) awardedBadges.push("feedback_5")
      }

      // Check for 20 feedback badge
      if (feedbackCount >= 20) {
        const awarded = await this.awardBadge(userId, "feedback_20")
        if (awarded) awardedBadges.push("feedback_20")
      }

      // Check for bug hunter badge
      if (bugReportCount >= 5) {
        const awarded = await this.awardBadge(userId, "bug_hunter")
        if (awarded) awardedBadges.push("bug_hunter")
      }

      // Check for idea machine badge
      if (suggestionCount >= 10) {
        const awarded = await this.awardBadge(userId, "idea_machine")
        if (awarded) awardedBadges.push("idea_machine")
      }

      return awardedBadges
    } catch (error) {
      console.error("Error checking feedback badges:", error)
      return []
    }
  }

  // Check and award task badges
  async checkTaskBadges(userId: string): Promise<string[]> {
    try {
      const awardedBadges: string[] = []

      // Get user document
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        return []
      }

      const userData = userDoc.data()
      const completedTasks = userData.completedBetaTasks || []
      const taskCount = completedTasks.length

      // Check for first task badge
      if (taskCount >= 1) {
        const awarded = await this.awardBadge(userId, "first_task")
        if (awarded) awardedBadges.push("first_task")
      }

      // Check for task master badge (all 10 tasks)
      if (taskCount >= 10) {
        const awarded = await this.awardBadge(userId, "task_master")
        if (awarded) awardedBadges.push("task_master")
      }

      // Check for specific task types
      const hasVideoTasks = completedTasks.some(
        (task) => task.includes("video") || task.includes("join-video") || task.includes("create-video"),
      )

      const hasChatTasks = completedTasks.some(
        (task) => task.includes("chat") || task.includes("join-chat") || task.includes("create-chat"),
      )

      const hasDJTasks = completedTasks.some(
        (task) => task.includes("dj") || task.includes("join-dj") || task.includes("create-dj"),
      )

      if (hasVideoTasks) {
        const awarded = await this.awardBadge(userId, "video_tester")
        if (awarded) awardedBadges.push("video_tester")
      }

      if (hasChatTasks) {
        const awarded = await this.awardBadge(userId, "chat_enthusiast")
        if (awarded) awardedBadges.push("chat_enthusiast")
      }

      if (hasDJTasks) {
        const awarded = await this.awardBadge(userId, "dj_fan")
        if (awarded) awardedBadges.push("dj_fan")
      }

      return awardedBadges
    } catch (error) {
      console.error("Error checking task badges:", error)
      return []
    }
  }

  // Get user's badges
  async getUserBadges(userId: string): Promise<Badge[]> {
    try {
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        return []
      }

      const userData = userDoc.data()
      return userData.badges || []
    } catch (error) {
      console.error("Error getting user badges:", error)
      return []
    }
  }

  // Get user's points
  async getUserPoints(userId: string): Promise<number> {
    try {
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        return 0
      }

      const userData = userDoc.data()
      return userData.gamificationPoints || 0
    } catch (error) {
      console.error("Error getting user points:", error)
      return 0
    }
  }

  // Get leaderboard
  async getLeaderboard(
    limit = 10,
  ): Promise<Array<{ userId: string; displayName: string; photoURL: string; points: number; badges: number }>> {
    try {
      const usersQuery = query(collection(db, "users"), where("gamificationPoints", ">", 0))

      const userDocs = await getDocs(usersQuery)

      const leaderboardData = userDocs.docs.map((doc) => {
        const data = doc.data()
        return {
          userId: doc.id,
          displayName: data.displayName || "Anonymous",
          photoURL: data.photoURL || "",
          points: data.gamificationPoints || 0,
          badges: (data.badges || []).length,
        }
      })

      // Sort by points (descending)
      leaderboardData.sort((a, b) => b.points - a.points)

      // Return top N users
      return leaderboardData.slice(0, limit)
    } catch (error) {
      console.error("Error getting leaderboard:", error)
      return []
    }
  }

  // Check for achievement badges
  async checkAchievementBadges(userId: string): Promise<string[]> {
    try {
      const awardedBadges: string[] = []

      // Get user document
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        return []
      }

      const userData = userDoc.data()
      const userBadges = userData.badges || []
      const badgeCount = userBadges.length

      // Check for beta legend badge (10+ badges)
      if (badgeCount >= 10) {
        const awarded = await this.awardBadge(userId, "beta_legend")
        if (awarded) awardedBadges.push("beta_legend")
      }

      // Check for early adopter badge
      const joinDate = userData.betaStatus?.joinedAt ? new Date(userData.betaStatus.joinedAt) : null
      const betaStartDate = new Date("2023-01-01") // Replace with actual beta start date

      if (joinDate) {
        const daysSinceBetaStart = Math.floor((joinDate.getTime() - betaStartDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysSinceBetaStart <= 7) {
          const awarded = await this.awardBadge(userId, "early_adopter")
          if (awarded) awardedBadges.push("early_adopter")
        }
      }

      // Check for beta veteran badge (30+ days active)
      const firstActivityDate = userData.firstActivityDate ? new Date(userData.firstActivityDate) : null
      const now = new Date()

      if (firstActivityDate) {
        const daysActive = Math.floor((now.getTime() - firstActivityDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysActive >= 30) {
          const awarded = await this.awardBadge(userId, "beta_veteran")
          if (awarded) awardedBadges.push("beta_veteran")
        }
      }

      return awardedBadges
    } catch (error) {
      console.error("Error checking achievement badges:", error)
      return []
    }
  }

  // --- New methods for badge leaderboard ---

  // Get badge collectors leaderboard
  async getBadgeCollectorsLeaderboard(
    limit = 10,
  ): Promise<Array<{ userId: string; displayName: string; photoURL: string; badgeCount: number }>> {
    try {
      const usersQuery = query(collection(db, "users"), where("badges", "!=", null))
      const userDocs = await getDocs(usersQuery)

      const leaderboardData = userDocs.docs
        .map((doc) => {
          const data = doc.data()
          return {
            userId: doc.id,
            displayName: data.displayName || "Anonymous",
            photoURL: data.photoURL || "",
            badgeCount: (data.badges || []).length,
          }
        })
        .filter((user) => user.badgeCount > 0) // Filter out users with no badges

      // Sort by badge count (descending)
      leaderboardData.sort((a, b) => b.badgeCount - a.badgeCount)

      // Return top N users
      return leaderboardData.slice(0, limit)
    } catch (error) {
      console.error("Error getting badge collectors leaderboard:", error)
      return []
    }
  }

  // Get category leaders
  async getCategoryLeaders(
    category: BadgeCategory,
    limit = 5,
  ): Promise<Array<{ userId: string; displayName: string; photoURL: string; badgeCount: number }>> {
    try {
      const usersQuery = query(collection(db, "users"), where("badges", "!=", null))
      const userDocs = await getDocs(usersQuery)

      const leaderboardData = userDocs.docs
        .map((doc) => {
          const data = doc.data()
          const badges = data.badges || []
          const categoryBadges = badges.filter((badge: Badge) => badge.category === category)

          return {
            userId: doc.id,
            displayName: data.displayName || "Anonymous",
            photoURL: data.photoURL || "",
            badgeCount: categoryBadges.length,
          }
        })
        .filter((user) => user.badgeCount > 0) // Filter out users with no badges in this category

      // Sort by badge count (descending)
      leaderboardData.sort((a, b) => b.badgeCount - a.badgeCount)

      // Return top N users
      return leaderboardData.slice(0, limit)
    } catch (error) {
      console.error(`Error getting ${category} leaders:`, error)
      return []
    }
  }

  // Get rarity leaders
  async getRarityLeaders(
    rarity: "legendary" | "epic" | "rare" | "uncommon" | "common",
    limit = 5,
  ): Promise<Array<{ userId: string; displayName: string; photoURL: string; badgeCount: number }>> {
    try {
      const usersQuery = query(collection(db, "users"), where("badges", "!=", null))
      const userDocs = await getDocs(usersQuery)

      const leaderboardData = userDocs.docs
        .map((doc) => {
          const data = doc.data()
          const badges = data.badges || []
          const rarityBadges = badges.filter((badge: Badge) => badge.rarity === rarity)

          return {
            userId: doc.id,
            displayName: data.displayName || "Anonymous",
            photoURL: data.photoURL || "",
            badgeCount: rarityBadges.length,
          }
        })
        .filter((user) => user.badgeCount > 0) // Filter out users with no badges of this rarity

      // Sort by badge count (descending)
      leaderboardData.sort((a, b) => b.badgeCount - a.badgeCount)

      // Return top N users
      return leaderboardData.slice(0, limit)
    } catch (error) {
      console.error(`Error getting ${rarity} badge leaders:`, error)
      return []
    }
  }

  // Get badge statistics
  async getBadgeStatistics(): Promise<{
    totalBadgesAwarded: number
    badgesByCategory: Record<BadgeCategory, number>
    badgesByRarity: Record<string, number>
    mostCommonBadges: Array<{ id: string; name: string; count: number }>
    rarestBadges: Array<{ id: string; name: string; count: number }>
  }> {
    try {
      const usersQuery = query(collection(db, "users"), where("badges", "!=", null))
      const userDocs = await getDocs(usersQuery)

      // Initialize counters
      let totalBadgesAwarded = 0
      const badgesByCategory: Record<BadgeCategory, number> = {
        feedback: 0,
        testing: 0,
        social: 0,
        technical: 0,
        community: 0,
        achievement: 0,
        challenge: 0,
      }
      const badgesByRarity: Record<string, number> = {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
      }
      const badgeCounts: Record<string, { id: string; name: string; count: number }> = {}

      // Collect data from all users
      userDocs.docs.forEach((doc) => {
        const data = doc.data()
        const badges = data.badges || []

        totalBadgesAwarded += badges.length

        badges.forEach((badge: Badge) => {
          // Count by category
          if (badge.category) {
            badgesByCategory[badge.category] = (badgesByCategory[badge.category] || 0) + 1
          }

          // Count by rarity
          if (badge.rarity) {
            badgesByRarity[badge.rarity] = (badgesByRarity[badge.rarity] || 0) + 1
          }

          // Count individual badges
          if (!badgeCounts[badge.id]) {
            badgeCounts[badge.id] = {
              id: badge.id,
              name: badge.name,
              count: 0,
            }
          }
          badgeCounts[badge.id].count++
        })
      })

      // Convert badge counts to arrays and sort
      const badgeCountsArray = Object.values(badgeCounts)
      const mostCommonBadges = [...badgeCountsArray].sort((a, b) => b.count - a.count).slice(0, 5)
      const rarestBadges = [...badgeCountsArray]
        .filter((badge) => badge.count > 0) // Only include badges that have been awarded at least once
        .sort((a, b) => a.count - b.count)
        .slice(0, 5)

      return {
        totalBadgesAwarded,
        badgesByCategory,
        badgesByRarity,
        mostCommonBadges,
        rarestBadges,
      }
    } catch (error) {
      console.error("Error getting badge statistics:", error)
      return {
        totalBadgesAwarded: 0,
        badgesByCategory: {
          feedback: 0,
          testing: 0,
          social: 0,
          technical: 0,
          community: 0,
          achievement: 0,
          challenge: 0,
        },
        badgesByRarity: {
          common: 0,
          uncommon: 0,
          rare: 0,
          epic: 0,
          legendary: 0,
        },
        mostCommonBadges: [],
        rarestBadges: [],
      }
    }
  }

  // Get recently awarded badges (across all users)
  async getRecentlyAwardedBadges(
    limit = 10,
  ): Promise<Array<{ userId: string; displayName: string; photoURL: string; badge: Badge }>> {
    try {
      const usersQuery = query(collection(db, "users"), where("badges", "!=", null))
      const userDocs = await getDocs(usersQuery)

      const recentBadges: Array<{
        userId: string
        displayName: string
        photoURL: string
        badge: Badge
        dateAwarded: Date
      }> = []

      // Collect recent badges from all users
      userDocs.docs.forEach((doc) => {
        const data = doc.data()
        const badges = data.badges || []

        badges.forEach((badge: Badge) => {
          if (badge.dateAwarded) {
            recentBadges.push({
              userId: doc.id,
              displayName: data.displayName || "Anonymous",
              photoURL: data.photoURL || "",
              badge,
              dateAwarded: new Date(badge.dateAwarded),
            })
          }
        })
      })

      // Sort by date awarded (descending)
      recentBadges.sort((a, b) => b.dateAwarded.getTime() - a.dateAwarded.getTime())

      // Return recent badges (without dateAwarded in the return type)
      return recentBadges.slice(0, limit).map(({ dateAwarded, ...rest }) => rest)
    } catch (error) {
      console.error("Error getting recently awarded badges:", error)
      return []
    }
  }
}

export const badgeService = new BadgeService()
