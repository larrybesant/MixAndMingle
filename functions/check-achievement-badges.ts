import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

// Badge types
interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  points: number
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
}

// Available badges (same as in badge-service.ts)
const BADGES: Badge[] = [
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

// Award a badge to a user
async function awardBadge(userId: string, badgeId: string): Promise<boolean> {
  try {
    // Get user document
    const userRef = db.collection("users").doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      console.error(`User ${userId} not found`)
      return false
    }

    const userData = userDoc.data()
    const userBadges = userData?.badges || []

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
    await userRef.update({
      badges: admin.firestore.FieldValue.arrayUnion(badgeWithDate),
      gamificationPoints: admin.firestore.FieldValue.increment(badge.points),
    })

    // Create notification
    await db.collection("notifications").add({
      userId,
      type: "system",
      title: "New Badge Earned!",
      body: `You've earned the "${badge.name}" badge: ${badge.description}`,
      image: `/badges/${badge.id}.png`,
      data: {
        badgeId,
        points: badge.points,
      },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error("Error awarding badge:", error)
    return false
  }
}

// Check for achievement badges
async function checkAchievementBadges(userId: string): Promise<string[]> {
  try {
    const awardedBadges: string[] = []

    // Get user document
    const userRef = db.collection("users").doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return []
    }

    const userData = userDoc.data()
    const userBadges = userData?.badges || []
    const badgeCount = userBadges.length

    // Check for beta legend badge (10+ badges)
    if (badgeCount >= 10) {
      const awarded = await awardBadge(userId, "beta_legend")
      if (awarded) awardedBadges.push("beta_legend")
    }

    // Check for early adopter badge
    const joinDate = userData?.betaStatus?.joinedAt ? new Date(userData.betaStatus.joinedAt) : null
    const betaStartDate = new Date("2023-01-01") // Replace with actual beta start date

    if (joinDate) {
      const daysSinceBetaStart = Math.floor((joinDate.getTime() - betaStartDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceBetaStart <= 7) {
        const awarded = await awardBadge(userId, "early_adopter")
        if (awarded) awardedBadges.push("early_adopter")
      }
    }

    // Check for beta veteran badge (30+ days active)
    const firstActivityDate = userData?.firstActivityDate ? new Date(userData.firstActivityDate) : null
    const now = new Date()

    if (firstActivityDate) {
      const daysActive = Math.floor((now.getTime() - firstActivityDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysActive >= 30) {
        const awarded = await awardBadge(userId, "beta_veteran")
        if (awarded) awardedBadges.push("beta_veteran")
      }
    }

    return awardedBadges
  } catch (error) {
    console.error("Error checking achievement badges:", error)
    return []
  }
}

// Cloud Function that runs daily to check for achievement badges
export const dailyAchievementBadgeCheck = functions.pubsub
  .schedule("0 0 * * *") // Run at midnight every day
  .timeZone("America/New_York")
  .onRun(async () => {
    try {
      // Get all beta testers
      const usersSnapshot = await db.collection("users").where("role", "==", "beta_tester").get()

      const promises: Promise<string[]>[] = []

      usersSnapshot.forEach((doc) => {
        promises.push(checkAchievementBadges(doc.id))
      })

      await Promise.all(promises)

      console.log(`Checked achievement badges for ${usersSnapshot.size} users`)

      return null
    } catch (error) {
      console.error("Error in dailyAchievementBadgeCheck:", error)
      return null
    }
  })
