import { getDatabase, ref, get, set, increment, onValue } from "firebase/database"
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"
import { getApp } from "firebase/app"

// Maximum number of beta testers allowed
export const MAX_BETA_TESTERS = 100

/**
 * Get the current beta tester count from Realtime Database
 */
export async function getBetaTesterCount(): Promise<number> {
  try {
    const db = getDatabase(getApp())
    const betaCountRef = ref(db, "betaStats/testerCount")
    const snapshot = await get(betaCountRef)
    return snapshot.exists() ? snapshot.val() : 0
  } catch (error) {
    console.error("Error getting beta tester count:", error)
    throw error
  }
}

/**
 * Subscribe to real-time updates of the beta tester count
 */
export function subscribeToBetaCount(callback: (count: number) => void): () => void {
  const db = getDatabase(getApp())
  const betaCountRef = ref(db, "betaStats/testerCount")

  const unsubscribe = onValue(betaCountRef, (snapshot) => {
    const count = snapshot.exists() ? snapshot.val() : 0
    callback(count)
  })

  return unsubscribe
}

/**
 * Increment the beta tester count when a new user joins
 */
export async function incrementBetaTesterCount(): Promise<number> {
  try {
    const db = getDatabase(getApp())
    const betaCountRef = ref(db, "betaStats/testerCount")

    // Increment the counter
    await set(betaCountRef, increment(1))

    // Get the updated count
    const snapshot = await get(betaCountRef)
    return snapshot.exists() ? snapshot.val() : 0
  } catch (error) {
    console.error("Error incrementing beta tester count:", error)
    throw error
  }
}

/**
 * Mark a user as a beta tester in Firestore
 */
export async function markUserAsBetaTester(userId: string): Promise<void> {
  try {
    const db = getFirestore(getApp())
    const userRef = doc(db, "users", userId)

    // Check if user document exists
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      // Update existing document
      await setDoc(
        userRef,
        {
          isBetaTester: true,
          betaJoinedAt: new Date().toISOString(),
        },
        { merge: true },
      )
    } else {
      // Create new document
      await setDoc(userRef, {
        id: userId,
        isBetaTester: true,
        betaJoinedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Error marking user as beta tester:", error)
    throw error
  }
}

/**
 * Check if a user is already a beta tester
 */
export async function isUserBetaTester(userId: string): Promise<boolean> {
  try {
    const db = getFirestore(getApp())
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      return userData.isBetaTester === true
    }

    return false
  } catch (error) {
    console.error("Error checking if user is beta tester:", error)
    throw error
  }
}
