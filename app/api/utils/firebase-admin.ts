import { db, auth, storage, messaging, Timestamp, FieldValue } from "@/lib/firebase-admin-safe"

// Re-export for use in API routes
export { db, auth, storage, messaging, Timestamp, FieldValue }

// Helper functions for common operations
export async function getUserById(userId: string) {
  try {
    const userRecord = await auth.getUser(userId)
    const userDoc = await db.collection("users").doc(userId).get()

    return {
      ...userRecord,
      ...(userDoc.exists ? userDoc.data() : {}),
    }
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error)
    return null
  }
}

export async function updateUserData(userId: string, data: Record<string, any>) {
  try {
    await db
      .collection("users")
      .doc(userId)
      .update({
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      })
    return true
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error)
    return false
  }
}

export async function sendNotification(
  userId: string,
  notification: {
    title: string
    body: string
    data?: Record<string, string>
  },
) {
  try {
    // Get user's FCM tokens
    const tokensSnapshot = await db.collection("users").doc(userId).collection("fcmTokens").get()

    if (tokensSnapshot.empty) {
      return { success: false, message: "No FCM tokens found for user" }
    }

    const tokens: string[] = []
    tokensSnapshot.forEach((doc) => {
      if (doc.data().token) {
        tokens.push(doc.data().token)
      }
    })

    if (tokens.length === 0) {
      return { success: false, message: "No valid FCM tokens found for user" }
    }

    // Send multicast message
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      tokens,
    }

    const response = await messaging.sendMulticast(message)

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    }
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error)
    return { success: false, message: String(error) }
  }
}
