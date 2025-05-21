/**
 * Notification Manager
 *
 * Handles push notification registration and management
 * Securely fetches VAPID key from server API
 */

// Cache for the FCM token to avoid unnecessary requests
let cachedFcmToken: string | null = null

/**
 * Register for push notifications
 * Requests permission, fetches VAPID key from server, and gets FCM token
 */
export async function registerForPushNotifications() {
  try {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications")
    }

    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      throw new Error("Notification permission denied")
    }

    // Import Firebase messaging dynamically
    const { getMessaging, getToken } = await import("firebase/messaging")
    const { getFirebaseApp } = await import("@/lib/firebase-service")

    const app = getFirebaseApp()
    const messaging = getMessaging(app)

    // Fetch VAPID key from server
    const vapidKey = await fetchVapidKey()

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: vapidKey,
    })

    // Cache the token
    cachedFcmToken = token

    // Save token to user's profile in Firestore if needed
    // await saveTokenToUserProfile(token);

    return token
  } catch (error) {
    console.error("Error registering for push notifications:", error)
    throw error
  }
}

/**
 * Fetch VAPID key from server
 * This keeps the VAPID key secure by not exposing it in client code
 */
async function fetchVapidKey(): Promise<string> {
  try {
    const response = await fetch("/api/config/vapid-key")

    if (!response.ok) {
      throw new Error(`Failed to fetch VAPID key: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.vapidKey) {
      throw new Error("VAPID key not available from server")
    }

    return data.vapidKey
  } catch (error) {
    console.error("Error fetching VAPID key:", error)
    throw error
  }
}

/**
 * Get the cached FCM token or fetch a new one
 */
export async function getFcmToken(): Promise<string | null> {
  if (cachedFcmToken) {
    return cachedFcmToken
  }

  try {
    return await registerForPushNotifications()
  } catch (error) {
    console.error("Error getting FCM token:", error)
    return null
  }
}

/**
 * Set up a listener for foreground messages
 */
export async function setupMessageListener(callback: (payload: any) => void) {
  try {
    const { getMessaging, onMessage } = await import("firebase/messaging")
    const { getFirebaseApp } = await import("@/lib/firebase-service")

    const app = getFirebaseApp()
    const messaging = getMessaging(app)

    return onMessage(messaging, callback)
  } catch (error) {
    console.error("Error setting up message listener:", error)
    throw error
  }
}
