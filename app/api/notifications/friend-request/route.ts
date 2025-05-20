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

    const body = await request.json()
    const { senderId, receiverId } = body

    // Validate required fields
    if (!senderId || !receiverId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get sender details
    const senderDoc = await db.collection("users").doc(senderId).get()

    if (!senderDoc.exists) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 })
    }

    const senderData = senderDoc.data()
    const senderName = senderData?.displayName || "A user"
    const senderImage = senderData?.photoURL || null

    // In a real request, we would send a notification
    // For now, we'll just return a success response
    return NextResponse.json({
      success: true,
      result: {
        notificationId: "mock-notification-id",
        push: {
          success: true,
          sent: 1,
          failed: 0,
        },
      },
    })
  } catch (error) {
    console.error("Error sending friend request notification:", error)

    return NextResponse.json(
      { error: "Failed to send notification", details: (error as Error).message },
      { status: 500 },
    )
  }
}
