import { NextResponse } from "next/server"
import { serverNotificationService } from "@/lib/server/notification-service"
import { getAdmin } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { roomId, senderId, invitedUserIds = [] } = body

    // Validate required fields
    if (!roomId || !senderId || invitedUserIds.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = getAdmin()

    // Get room details
    const roomDoc = await db.collection("rooms").doc(roomId).get()

    if (!roomDoc.exists) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const roomData = roomDoc.data()
    const roomName = roomData?.name || "Chat Room"

    // Get sender details
    const senderDoc = await db.collection("users").doc(senderId).get()

    if (!senderDoc.exists) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 })
    }

    const senderData = senderDoc.data()
    const senderName = senderData?.displayName || "A user"
    const senderImage = senderData?.photoURL || null

    // Send notifications to all invited users
    const results = await Promise.all(
      invitedUserIds.map((userId) =>
        serverNotificationService.sendRoomInviteNotification(
          userId,
          senderName,
          senderImage,
          roomName,
          roomId,
          senderId,
        ),
      ),
    )

    return NextResponse.json({
      success: true,
      notifiedUsers: invitedUserIds.length,
      results,
    })
  } catch (error) {
    console.error("Error sending room invite notifications:", error)

    return NextResponse.json(
      { error: "Failed to send notifications", details: (error as Error).message },
      { status: 500 },
    )
  }
}
