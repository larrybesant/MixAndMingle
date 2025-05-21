import { db } from "./auth-setup"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"

export interface UserProfile {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  bio?: string
  createdAt: any
  lastLogin: any
  onlineStatus: "online" | "offline" | "away"
}

export const userService = {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", userId))

      if (userDoc.exists()) {
        return userDoc.data() as UserProfile
      }

      return null
    } catch (error) {
      console.error("Error getting user profile:", error)
      throw error
    }
  },

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, "users", userId), {
        ...data,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating user profile:", error)
      throw error
    }
  },

  async updateOnlineStatus(userId: string, status: "online" | "offline" | "away"): Promise<void> {
    try {
      await updateDoc(doc(db, "users", userId), {
        onlineStatus: status,
        lastSeen: status === "offline" ? serverTimestamp() : null,
      })
    } catch (error) {
      console.error("Error updating online status:", error)
      throw error
    }
  },
}
