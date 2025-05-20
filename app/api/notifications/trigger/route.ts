import { NextResponse } from "next/server"
import { db } from "@/lib/firebase-admin"
import { isBuildEnvironment } from "@/lib/private-key-handler"

export async function POST(request: Request) {
  try {
    // Skip actual processing during build
    if (isBuildEnvironment()) {
      console.log("Build environment detected, returning mock response")
      return NextResponse.json({
        success: true,
        message: "Build-time mock response",
      })
    }

    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json({ error: "Missing notification ID" }, { status: 400 })
    }

    // Get notification from Firestore
    const notificationDoc = await db.collection("notifications").doc(notificationId).get()

    if (!notificationDoc.exists) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // In a real request, we would send the notification
    // For now, we'll just return a success response
    return NextResponse.json({
      success: true,
      sent: 1,
      failed: 0,
    })
  } catch (error) {
    console.error("Error triggering notification:", error)

    return NextResponse.json({ error: "Failed to trigger notification" }, { status: 500 })
  }
}
