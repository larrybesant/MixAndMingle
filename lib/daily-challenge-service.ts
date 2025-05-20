import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  increment,
} from "firebase/firestore"
import { badgeService } from "@/lib/badge-service"
import { notificationService } from "@/lib/notification-service"

// Challenge types
export type ChallengeCategory = "feedback" | "testing" | "social" | "exploration" | "engagement" | "technical"

export type ChallengeReward = {
  points: number
  streakBonus?: number
}

export type ChallengeRequirement = {
  type: string
  count: number
  target?: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  category: ChallengeCategory
  icon: string
  requirements: ChallengeRequirement[]
  reward: ChallengeReward
  difficulty: "easy" | "medium" | "hard"
  isActive: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface DailyChallenge extends Challenge {
  date: string // YYYY-MM-DD format
  expiresAt: Timestamp
}

export interface UserChallenge {
  challengeId: string
  date: string
  status: "active" | "completed" | "expired"
  progress: number
  completedAt?: Timestamp
  reward?: {
    points: number
    streakBonus: number
  }
}

export interface UserChallengeStats {
  totalCompleted: number
  currentStreak: number
  longestStreak: number
  lastCompletedDate?: string
  totalPoints: number
}

class DailyChallengeService {
  private readonly CHALLENGE_COLLECTION = "dailyChallenges"
  private readonly USER_CHALLENGES_COLLECTION = "userChallenges"
  private readonly CHALLENGE_POOL_COLLECTION = "challengePool"
  private readonly CHALLENGE_STATS_COLLECTION = "challengeStats"

  // Get today's date in YYYY-MM-DD format
  private getTodayDateString(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  }

  // Get yesterday's date in YYYY-MM-DD format
  private getYesterdayDateString(): string {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`
  }

  // Get tomorrow's date in YYYY-MM-DD format
  private getTomorrowDateString(): string {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`
  }

  // Get expiration timestamp (end of day)
  private getExpirationTimestamp(dateString: string): Timestamp {
    const [year, month, day] = dateString.split("-").map(Number)
    const date = new Date(year, month - 1, day, 23, 59, 59)
    return Timestamp.fromDate(date)
  }

  // Get active challenges from the challenge pool
  async getActiveChallengesFromPool(): Promise<Challenge[]> {
    try {
      const challengesRef = collection(db, this.CHALLENGE_POOL_COLLECTION)
      const q = query(challengesRef, where("isActive", "==", true))
      const querySnapshot = await getDocs(q)

      const challenges: Challenge[] = []
      querySnapshot.forEach((doc) => {
        challenges.push({ id: doc.id, ...doc.data() } as Challenge)
      })

      return challenges
    } catch (error) {
      console.error("Error getting active challenges from pool:", error)
      return []
    }
  }

  // Generate daily challenges for a specific date
  async generateDailyChallenges(date: string = this.getTodayDateString()): Promise<DailyChallenge[]> {
    try {
      // Check if challenges already exist for this date
      const existingChallenges = await this.getDailyChallenges(date)
      if (existingChallenges.length > 0) {
        return existingChallenges
      }

      // Get active challenges from the pool
      const activeChallenges = await this.getActiveChallengesFromPool()
      if (activeChallenges.length === 0) {
        console.error("No active challenges found in the pool")
        return []
      }

      // Randomly select 3 challenges (1 easy, 1 medium, 1 hard)
      const easyChallenges = activeChallenges.filter((c) => c.difficulty === "easy")
      const mediumChallenges = activeChallenges.filter((c) => c.difficulty === "medium")
      const hardChallenges = activeChallenges.filter((c) => c.difficulty === "hard")

      const getRandomChallenge = (challenges: Challenge[]) => {
        if (challenges.length === 0) return null
        return challenges[Math.floor(Math.random() * challenges.length)]
      }

      const selectedChallenges: Challenge[] = []

      const easyChallenge = getRandomChallenge(easyChallenges)
      if (easyChallenge) selectedChallenges.push(easyChallenge)

      const mediumChallenge = getRandomChallenge(mediumChallenges)
      if (mediumChallenge) selectedChallenges.push(mediumChallenge)

      const hardChallenge = getRandomChallenge(hardChallenges)
      if (hardChallenge) selectedChallenges.push(hardChallenge)

      // Create daily challenges
      const dailyChallenges: DailyChallenge[] = selectedChallenges.map((challenge) => ({
        ...challenge,
        date,
        expiresAt: this.getExpirationTimestamp(date),
      }))

      // Save daily challenges to Firestore
      const batch = db.batch()

      dailyChallenges.forEach((challenge) => {
        const challengeRef = doc(db, this.CHALLENGE_COLLECTION, `${date}_${challenge.id}`)
        batch.set(challengeRef, {
          ...challenge,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      })

      await batch.commit()

      return dailyChallenges
    } catch (error) {
      console.error("Error generating daily challenges:", error)
      return []
    }
  }

  // Get daily challenges for a specific date
  async getDailyChallenges(date: string = this.getTodayDateString()): Promise<DailyChallenge[]> {
    try {
      const challengesRef = collection(db, this.CHALLENGE_COLLECTION)
      const q = query(challengesRef, where("date", "==", date))
      const querySnapshot = await getDocs(q)

      const challenges: DailyChallenge[] = []
      querySnapshot.forEach((doc) => {
        challenges.push(doc.data() as DailyChallenge)
      })

      return challenges
    } catch (error) {
      console.error("Error getting daily challenges:", error)
      return []
    }
  }

  // Get user's challenges for a specific date
  async getUserChallenges(userId: string, date: string = this.getTodayDateString()): Promise<UserChallenge[]> {
    try {
      if (!userId) return []

      const userChallengesRef = collection(db, this.USER_CHALLENGES_COLLECTION, userId, "challenges")
      const q = query(userChallengesRef, where("date", "==", date))
      const querySnapshot = await getDocs(q)

      const userChallenges: UserChallenge[] = []
      querySnapshot.forEach((doc) => {
        userChallenges.push(doc.data() as UserChallenge)
      })

      // If no user challenges found for today, initialize them
      if (userChallenges.length === 0) {
        const dailyChallenges = await this.getDailyChallenges(date)
        if (dailyChallenges.length > 0) {
          await this.initializeUserChallenges(userId, dailyChallenges)
          return this.getUserChallenges(userId, date)
        }
      }

      return userChallenges
    } catch (error) {
      console.error("Error getting user challenges:", error)
      return []
    }
  }

  // Initialize user challenges for a specific date
  private async initializeUserChallenges(userId: string, dailyChallenges: DailyChallenge[]): Promise<void> {
    try {
      const batch = db.batch()

      dailyChallenges.forEach((challenge) => {
        const userChallengeRef = doc(
          db,
          this.USER_CHALLENGES_COLLECTION,
          userId,
          "challenges",
          `${challenge.date}_${challenge.id}`,
        )

        batch.set(userChallengeRef, {
          challengeId: challenge.id,
          date: challenge.date,
          status: "active",
          progress: 0,
        })
      })

      await batch.commit()
    } catch (error) {
      console.error("Error initializing user challenges:", error)
    }
  }

  // Update user challenge progress
  async updateChallengeProgress(
    userId: string,
    challengeId: string,
    date: string = this.getTodayDateString(),
    progressIncrement = 1,
  ): Promise<boolean> {
    try {
      if (!userId || !challengeId) return false

      // Get the challenge details
      const challengeRef = doc(db, this.CHALLENGE_COLLECTION, `${date}_${challengeId}`)
      const challengeDoc = await getDoc(challengeRef)

      if (!challengeDoc.exists()) {
        console.error(`Challenge ${challengeId} not found for date ${date}`)
        return false
      }

      const challenge = challengeDoc.data() as DailyChallenge

      // Get the user challenge
      const userChallengeRef = doc(db, this.USER_CHALLENGES_COLLECTION, userId, "challenges", `${date}_${challengeId}`)

      const userChallengeDoc = await getDoc(userChallengeRef)

      if (!userChallengeDoc.exists()) {
        // Initialize the user challenge if it doesn't exist
        await setDoc(userChallengeRef, {
          challengeId,
          date,
          status: "active",
          progress: progressIncrement,
        })

        return true
      }

      const userChallenge = userChallengeDoc.data() as UserChallenge

      // If already completed, do nothing
      if (userChallenge.status === "completed") {
        return false
      }

      // If expired, do nothing
      if (userChallenge.status === "expired") {
        return false
      }

      // Update progress
      const newProgress = userChallenge.progress + progressIncrement

      // Check if the challenge is now completed
      const requirement = challenge.requirements[0] // For simplicity, we're using the first requirement
      const isCompleted = newProgress >= requirement.count

      if (isCompleted) {
        // Calculate reward with streak bonus
        const stats = await this.getUserChallengeStats(userId)
        const streakBonus = stats.currentStreak > 0 ? Math.min(stats.currentStreak * 0.1, 0.5) : 0
        const bonusPoints = Math.floor(challenge.reward.points * streakBonus)

        const reward = {
          points: challenge.reward.points,
          streakBonus: bonusPoints,
        }

        // Update user challenge
        await updateDoc(userChallengeRef, {
          progress: newProgress,
          status: "completed",
          completedAt: serverTimestamp(),
          reward,
        })

        // Update user stats
        await this.updateUserChallengeStats(userId, challenge.reward.points + bonusPoints)

        // Send notification
        await notificationService.createNotification({
          userId,
          type: "system",
          title: "Challenge Completed!",
          body: `You've completed the "${challenge.title}" challenge and earned ${challenge.reward.points + bonusPoints} points!`,
          data: {
            challengeId,
            points: challenge.reward.points + bonusPoints,
          },
        })

        // Check for challenge-related badges
        await this.checkChallengeRelatedBadges(userId)

        return true
      } else {
        // Just update progress
        await updateDoc(userChallengeRef, {
          progress: newProgress,
        })

        return true
      }
    } catch (error) {
      console.error("Error updating challenge progress:", error)
      return false
    }
  }

  // Get user challenge stats
  async getUserChallengeStats(userId: string): Promise<UserChallengeStats> {
    try {
      if (!userId) {
        return {
          totalCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalPoints: 0,
        }
      }

      const statsRef = doc(db, this.CHALLENGE_STATS_COLLECTION, userId)
      const statsDoc = await getDoc(statsRef)

      if (!statsDoc.exists()) {
        // Initialize stats if they don't exist
        const initialStats: UserChallengeStats = {
          totalCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalPoints: 0,
        }

        await setDoc(statsRef, initialStats)
        return initialStats
      }

      return statsDoc.data() as UserChallengeStats
    } catch (error) {
      console.error("Error getting user challenge stats:", error)
      return {
        totalCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
      }
    }
  }

  // Update user challenge stats
  private async updateUserChallengeStats(userId: string, pointsToAdd: number): Promise<void> {
    try {
      const statsRef = doc(db, this.CHALLENGE_STATS_COLLECTION, userId)
      const statsDoc = await getDoc(statsRef)

      const today = this.getTodayDateString()
      const yesterday = this.getYesterdayDateString()

      if (!statsDoc.exists()) {
        // Initialize stats if they don't exist
        await setDoc(statsRef, {
          totalCompleted: 1,
          currentStreak: 1,
          longestStreak: 1,
          lastCompletedDate: today,
          totalPoints: pointsToAdd,
        })

        // Also update user's gamification points
        const userRef = doc(db, "users", userId)
        await updateDoc(userRef, {
          gamificationPoints: increment(pointsToAdd),
        })

        return
      }

      const stats = statsDoc.data() as UserChallengeStats

      // Update streak
      let newCurrentStreak = stats.currentStreak
      let newLongestStreak = stats.longestStreak

      if (stats.lastCompletedDate === yesterday) {
        // Continuing the streak
        newCurrentStreak += 1
        if (newCurrentStreak > newLongestStreak) {
          newLongestStreak = newCurrentStreak
        }
      } else if (stats.lastCompletedDate !== today) {
        // Streak broken
        newCurrentStreak = 1
      }

      // Update stats
      await updateDoc(statsRef, {
        totalCompleted: increment(1),
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastCompletedDate: today,
        totalPoints: increment(pointsToAdd),
      })

      // Also update user's gamification points
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        gamificationPoints: increment(pointsToAdd),
      })
    } catch (error) {
      console.error("Error updating user challenge stats:", error)
    }
  }

  // Check for challenge-related badges
  private async checkChallengeRelatedBadges(userId: string): Promise<void> {
    try {
      const stats = await this.getUserChallengeStats(userId)

      // Check for badges based on total completed challenges
      if (stats.totalCompleted >= 1) {
        await badgeService.awardBadge(userId, "first_challenge")
      }

      if (stats.totalCompleted >= 10) {
        await badgeService.awardBadge(userId, "challenge_enthusiast")
      }

      if (stats.totalCompleted >= 30) {
        await badgeService.awardBadge(userId, "challenge_master")
      }

      // Check for streak badges
      if (stats.currentStreak >= 3) {
        await badgeService.awardBadge(userId, "three_day_streak")
      }

      if (stats.currentStreak >= 7) {
        await badgeService.awardBadge(userId, "weekly_streak")
      }

      if (stats.currentStreak >= 30) {
        await badgeService.awardBadge(userId, "monthly_streak")
      }
    } catch (error) {
      console.error("Error checking challenge-related badges:", error)
    }
  }

  // Get challenge leaderboard
  async getChallengeLeaderboard(limit = 10): Promise<
    Array<{
      userId: string
      displayName: string
      photoURL: string
      totalCompleted: number
      currentStreak: number
      totalPoints: number
    }>
  > {
    try {
      const statsRef = collection(db, this.CHALLENGE_STATS_COLLECTION)
      const statsSnapshot = await getDocs(statsRef)

      const leaderboardData: Array<{
        userId: string
        totalCompleted: number
        currentStreak: number
        totalPoints: number
        displayName?: string
        photoURL?: string
      }> = []

      statsSnapshot.forEach((doc) => {
        const data = doc.data() as UserChallengeStats
        leaderboardData.push({
          userId: doc.id,
          totalCompleted: data.totalCompleted,
          currentStreak: data.currentStreak,
          totalPoints: data.totalPoints,
        })
      })

      // Sort by total points (descending)
      leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints)

      // Get user details for the top users
      const topUsers = leaderboardData.slice(0, limit)

      const userDetailsPromises = topUsers.map(async (userData) => {
        const userRef = doc(db, "users", userData.userId)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const user = userDoc.data()
          return {
            ...userData,
            displayName: user.displayName || "Anonymous",
            photoURL: user.photoURL || "",
          }
        }

        return {
          ...userData,
          displayName: "Anonymous",
          photoURL: "",
        }
      })

      return Promise.all(userDetailsPromises)
    } catch (error) {
      console.error("Error getting challenge leaderboard:", error)
      return []
    }
  }

  // Add a new challenge to the pool
  async addChallengeToPool(challenge: Omit<Challenge, "id" | "createdAt" | "updatedAt">): Promise<string | null> {
    try {
      const challengesRef = collection(db, this.CHALLENGE_POOL_COLLECTION)

      const newChallengeRef = doc(challengesRef)

      await setDoc(newChallengeRef, {
        ...challenge,
        id: newChallengeRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return newChallengeRef.id
    } catch (error) {
      console.error("Error adding challenge to pool:", error)
      return null
    }
  }

  // Update a challenge in the pool
  async updateChallengeInPool(challengeId: string, updates: Partial<Challenge>): Promise<boolean> {
    try {
      const challengeRef = doc(db, this.CHALLENGE_POOL_COLLECTION, challengeId)

      await updateDoc(challengeRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })

      return true
    } catch (error) {
      console.error("Error updating challenge in pool:", error)
      return false
    }
  }

  // Get all challenges from the pool
  async getAllChallengesFromPool(): Promise<Challenge[]> {
    try {
      const challengesRef = collection(db, this.CHALLENGE_POOL_COLLECTION)
      const querySnapshot = await getDocs(challengesRef)

      const challenges: Challenge[] = []
      querySnapshot.forEach((doc) => {
        challenges.push({ id: doc.id, ...doc.data() } as Challenge)
      })

      return challenges
    } catch (error) {
      console.error("Error getting all challenges from pool:", error)
      return []
    }
  }

  // Get a specific challenge from the pool
  async getChallengeFromPool(challengeId: string): Promise<Challenge | null> {
    try {
      const challengeRef = doc(db, this.CHALLENGE_POOL_COLLECTION, challengeId)
      const challengeDoc = await getDoc(challengeRef)

      if (!challengeDoc.exists()) {
        return null
      }

      return { id: challengeDoc.id, ...challengeDoc.data() } as Challenge
    } catch (error) {
      console.error("Error getting challenge from pool:", error)
      return null
    }
  }
}

export const dailyChallengeService = new DailyChallengeService()
