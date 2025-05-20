import { NextResponse } from "next/server"
import { serverNotificationService } from "@/lib/server/notification-service"
import { getAdmin } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { roomId, messageId, senderId, senderName, messageText, excludeUserIds = [] } = body

    // Validate required fields
    if (!roomId || !messageId || !senderId || !senderName || !messageText) {
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
    const senderImage = senderData?.photoURL || null

    // Get room members
    const membersQuery = await db.collection("roomMembers").where("roomId", "==", roomId).get()

    const memberIds: string[] = []

    membersQuery.forEach((doc) => {
      const memberId = doc.data().userId

      // Exclude sender and any other excluded users
      if (memberId !== senderId && !excludeUserIds.includes(memberId)) {
        memberIds.push(memberId)
      }
    })

    if (memberIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No members to notify",
      })
    }

    // Send notifications to all members
    const results = await Promise.all(
      memberIds.map((userId) =>
        serverNotificationService.sendChatMessageNotification(
          userId,
          senderName,
          senderImage,
          roomName,
          messageText,
          roomId,
          messageId,
          senderId,
        ),
      ),
    )

    return NextResponse.json({
      success: true,
      notifiedUsers: memberIds.length,
      results,
    })
  } catch (error) {
    console.error("Error sending chat message notifications:", error)

    return NextResponse.json(
      { error: "Failed to send notifications", details: (error as Error).message },
      { status: 500 },
    )
  }
}
