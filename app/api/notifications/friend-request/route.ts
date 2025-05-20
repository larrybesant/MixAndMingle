import { NextResponse } from "next/server"
import { serverNotificationService } from "@/lib/server/notification-service"
import { getAdmin } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { senderId, receiverId } = body

    // Validate required fields
    if (!senderId || !receiverId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = getAdmin()

    // Get sender details
    const senderDoc = await db.collection("users").doc(senderId).get()

    if (!senderDoc.exists) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 })
    }

    const senderData = senderDoc.data()
    const senderName = senderData?.displayName || "A user"
    const senderImage = senderData?.photoURL || null

    // Send notification
    const result = await serverNotificationService.sendFriendRequestNotification(
      receiverId,
      senderName,
      senderImage,
      senderId,
    )

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("Error sending friend request notification:", error)

    return NextResponse.json(
      { error: "Failed to send notification", details: (error as Error).message },
      { status: 500 },
    )
  }
}
