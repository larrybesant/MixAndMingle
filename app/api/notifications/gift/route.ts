import { NextResponse } from "next/server"
import { serverNotificationService } from "@/lib/server/notification-service"
import { getAdmin } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { senderId, receiverId, giftId } = body

    // Validate required fields
    if (!senderId || !receiverId || !giftId) {
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

    // Get gift details
    const giftDoc = await db.collection("gifts").doc(giftId).get()

    if (!giftDoc.exists) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 })
    }

    const giftData = giftDoc.data()
    const giftName = giftData?.name || "gift"
    const giftImage = giftData?.imageUrl || null

    // Send notification
    const result = await serverNotificationService.sendGiftNotification(
      receiverId,
      senderName,
      senderImage,
      giftName,
      giftImage,
      senderId,
      giftId,
    )

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("Error sending gift notification:", error)

    return NextResponse.json(
      { error: "Failed to send notification", details: (error as Error).message },
      { status: 500 },
    )
  }
}
