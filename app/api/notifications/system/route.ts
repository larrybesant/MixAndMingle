import { NextResponse } from "next/server"
import { serverNotificationService } from "@/lib/server/notification-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userIds, title, body: notificationBody, image } = body

    // Validate required fields
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !title || !notificationBody) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Send notifications to all users
    const results = await Promise.all(
      userIds.map((userId) => serverNotificationService.sendSystemNotification(userId, title, notificationBody, image)),
    )

    return NextResponse.json({
      success: true,
      notifiedUsers: userIds.length,
      results,
    })
  } catch (error) {
    console.error("Error sending system notifications:", error)

    return NextResponse.json(
      { error: "Failed to send notifications", details: (error as Error).message },
      { status: 500 },
    )
  }
}
