import { NextResponse } from "next/server"
import { serverNotificationService } from "@/lib/server/notification-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, type, title, body: notificationBody, data, image } = body

    // Validate required fields
    if (!userId || !type || !title || !notificationBody) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Send notification
    const result = await serverNotificationService.createAndSendNotification(
      userId,
      type,
      title,
      notificationBody,
      data,
      image,
    )

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error sending notification:", error)

    return NextResponse.json(
      { error: "Failed to send notification", details: (error as Error).message },
      { status: 500 },
    )
  }
}
