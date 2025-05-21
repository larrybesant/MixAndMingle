import { NextResponse } from "next/server"
import { auth, messaging } from "@/lib/firebase-admin-safe" // Updated import
import { db } from "@/lib/firebase-admin-safe" // Declared db variable

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, title, body: notificationBody, data, image } = body

    // Validate required fields
    if (!userId || !title || !notificationBody) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user
    const user = await auth.getUser(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get FCM tokens
    const userDoc = await db.collection("users").doc(userId).get()
    const fcmTokens = userDoc.data()?.fcmTokens || []

    if (fcmTokens.length === 0) {
      return NextResponse.json({ error: "No FCM tokens found for user" }, { status: 404 })
    }

    // Send notification
    const message = {
      notification: {
        title,
        body: notificationBody,
        imageUrl: image,
      },
      data: data || {},
      tokens: fcmTokens,
    }

    const response = await messaging.sendMulticast(message)

    return NextResponse.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json(
      { error: "Failed to send notification", details: (error as Error).message },
      { status: 500 },
    )
  }
}
