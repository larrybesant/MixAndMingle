import { NextResponse } from "next/server"
import { serverNotificationService } from "@/lib/server/notification-service"
import { getAdmin } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { roomId, messageId, senderId, senderName, messageText, mentionedUsernames = [] } = body

    // Validate required fields
    if (!roomId || !messageId || !senderId || !senderName || !messageText || mentionedUsernames.length === 0) {
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

    // Get mentioned users
    const usersQuery = await db.collection("users").where("username", "in", mentionedUsernames).get()

    const mentionedUsers: { id: string; username: string }[] = []

    usersQuery.forEach((doc) => {
      const userData = doc.data()

      // Don't notify the sender if they mention themselves
      if (doc.id !== senderId) {
        mentionedUsers.push({
          id: doc.id,
          username: userData.username,
        })
      }
    })

    if (mentionedUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users to notify",
      })
    }

    // Send notifications to all mentioned users
    const results = await Promise.all(
      mentionedUsers.map((user) =>
        serverNotificationService.sendMentionNotification(
          user.id,
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
      notifiedUsers: mentionedUsers.length,
      results,
    })
  } catch (error) {
    console.error("Error sending mention notifications:", error)

    return NextResponse.json(
      { error: "Failed to send notifications", details: (error as Error).message },
      { status: 500 },
    )
  }
}
