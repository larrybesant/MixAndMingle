import { NextResponse } from "next/server"
import { serverNotificationService } from "@/lib/server/notification-service"
import { getAdmin } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const { db } = getAdmin()
    const body = await request.json()
    const { roomId, messageId, senderId, recipientId, messageText } = body

    if (!roomId || !messageId || !senderId || !recipientId || !messageText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get sender information
    const senderDoc = await db.collection("users").doc(senderId).get()
    if (!senderDoc.exists) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 })
    }
    const senderData = senderDoc.data()
    const senderName = senderData?.displayName || "A user"
    const senderImage = senderData?.photoURL || null

    // Get room information
    const roomDoc = await db.collection("chatRooms").doc(roomId).get()
    if (!roomDoc.exists) {
      return NextResponse.json({ error: "Chat room not found" }, { status: 404 })
    }
    const roomData = roomDoc.data()
    const roomName = roomData?.name || "a chat room"

    // Send notification
    const result = await serverNotificationService.sendChatMessageNotification(
      recipientId,
      senderName,
      senderImage,
      roomName,
      messageText,
      roomId,
      messageId,
      senderId,
    )

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error sending chat message notification:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
