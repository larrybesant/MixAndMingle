import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { getMessaging, onMessage, getToken } from "firebase/messaging"

class FCMService {
  messaging: any
  initialized = false
  vapidKey: string | null = null

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

          // Play sound based on notification type - audioService will check if this type is enabled
          if (payload.data?.type) {
            // If audioService is available
            if (typeof window !== "undefined" && (window as any).audioService) {
              ;(window as any).audioService.playSound(payload.data.type)
            }
          }

          this.showNotification(payload)
        })
      }
    } catch (error) {
      console.error("Failed to initialize FCM:", error)
    }
  }

  // Fetch VAPID key from server
  async getVapidKey(): Promise<string | null> {
    if (this.vapidKey) return this.vapidKey

    try {
      const response = await fetch("/api/config/vapid-key")
      if (!response.ok) {
        throw new Error("Failed to fetch VAPID key")
      }

      const data = await response.json()
      this.vapidKey = data.vapidKey
      return this.vapidKey
    } catch (error) {
      console.error("Error fetching VAPID key:", error)
      return null
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
        // Get VAPID key from server
        const vapidKey = await this.getVapidKey()

        if (!vapidKey) {
          console.error("VAPID key not available")
          return null
        }

        // Get token with VAPID key
        const token = await getToken(this.messaging, {
          vapidKey,
          serviceWorkerRegistration: await navigator.serviceWorker.getRegistration(),
        })

        if (token) {
          await this.saveTokenToDatabase(userId, token)
          return token
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
      const notificationType = payload.data?.type || "system"

      // Play notification sound - if audioService is available
      if (typeof window !== "undefined" && (window as any).audioService) {
        ;(window as any).audioService.playSound(notificationType)
      }

      const options = {
        body,
        icon: image || "/logo.png",
        badge: "/badge.png",
        data: payload.data,
        silent: false, // We'll handle the sound ourselves
      }

      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options)
      })
    }
  }
}

export const fcmService = new FCMService()
