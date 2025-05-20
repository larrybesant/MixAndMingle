import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { getMessaging, onMessage } from "firebase/messaging"

class FCMService {
  messaging: any
  initialized = false

  // Initialize Firebase Cloud Messaging
  async initialize() {
    if (this.initialized) return

    try {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        const firebaseApp = (await import("@/lib/firebase")).default

        this.messaging = getMessaging(firebaseApp)

        // Register service worker
        await navigator.serviceWorker.register("/firebase-messaging-sw.js")

        this.initialized = true

        // Set up message listener
        onMessage(this.messaging, (payload) => {
          console.log("Message received:", payload)
          this.showNotification(payload)
        })
      }
    } catch (error) {
      console.error("Failed to initialize FCM:", error)
    }
  }

  // Request permission and get FCM token
  async requestPermissionAndGetToken(userId: string): Promise<string | null> {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      const permission = await Notification.requestPermission()

      if (permission === "granted") {
        // Get token via server API instead of directly
        const response = await fetch("/api/notifications/register-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        })

        if (!response.ok) {
          throw new Error("Failed to register FCM token")
        }

        const data = await response.json()

        if (data.token) {
          return data.token
        }
      }

      return null
    } catch (error) {
      console.error("Failed to get FCM token:", error)
      return null
    }
  }

  // Save FCM token to Firestore
  async saveTokenToDatabase(userId: string, token: string): Promise<void> {
    try {
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const tokens = userData.fcmTokens || []

        // Only add token if it doesn't exist
        if (!tokens.includes(token)) {
          await updateDoc(userRef, {
            fcmTokens: [...tokens, token],
          })
        }
      } else {
        await setDoc(
          userRef,
          {
            fcmTokens: [token],
          },
          { merge: true },
        )
      }
    } catch (error) {
      console.error("Failed to save token to database:", error)
    }
  }

  // Remove FCM token from Firestore
  async removeTokenFromDatabase(userId: string, token: string): Promise<void> {
    try {
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const tokens = userData.fcmTokens || []

        // Remove token
        const updatedTokens = tokens.filter((t: string) => t !== token)

        await updateDoc(userRef, {
          fcmTokens: updatedTokens,
        })
      }
    } catch (error) {
      console.error("Failed to remove token from database:", error)
    }
  }

  // Show notification using the Notification API
  showNotification(payload: any) {
    if (Notification.permission === "granted" && payload.notification) {
      const { title, body, image } = payload.notification

      const options = {
        body,
        icon: image || "/logo.png",
        badge: "/badge.png",
        data: payload.data,
      }

      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options)
      })
    }
  }
}

export const fcmService = new FCMService()
