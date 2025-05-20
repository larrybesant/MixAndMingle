import { NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import { initAdmin } from "@/lib/firebase-admin"
import { getMessaging } from "firebase-admin/messaging"

// Initialize Firebase Admin
initAdmin()

export async function POST(request: Request) {
  try {
    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json({ error: "Missing notification ID" }, { status: 400 })
    }

    // Get notification from Firestore
    const db = getFirestore()
    const notificationDoc = await db.collection("notifications").doc(notificationId).get()

    if (!notificationDoc.exists) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    const notification = notificationDoc.data()

    // Get user's FCM tokens and notification preferences
    const userDoc = await db.collection("users").doc(notification.userId).get()

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = userDoc.data()
    const fcmTokens = userData?.fcmTokens || []
    const preferences = userData?.notificationPreferences || {}

    // Check if user has enabled this type of notification
    const notificationType = notification.type
    const preferenceKey = `${notificationType}Notifications`

    if (preferences[preferenceKey] === false) {
      return NextResponse.json({ message: "User has disabled this notification type" }, { status: 200 })
    }

    // Check if push notifications are enabled
    if (!preferences.pushEnabled || fcmTokens.length === 0) {
      return NextResponse.json({ message: "Push notifications disabled or no tokens" }, { status: 200 })
    }

    // Send push notification
    const messaging = getMessaging()

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        image: notification.image,
      },
      data: notification.data || {},
      tokens: fcmTokens,
    }

    const response = await messaging.sendMulticast(message)

    // Handle token cleanup if needed
    if (response.failureCount > 0) {
      const failedTokens: string[] = []

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(fcmTokens[idx])
        }
      })

      // Remove failed tokens
      if (failedTokens.length > 0) {
        const validTokens = fcmTokens.filter((token) => !failedTokens.includes(token))
        await db.collection("users").doc(notification.userId).update({
          fcmTokens: validTokens,
        })
      }
    }

    return NextResponse.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    })
  } catch (error) {
    console.error("Error triggering notification:", error)

    return NextResponse.json({ error: "Failed to trigger notification" }, { status: 500 })
  }
}
