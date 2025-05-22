import { NextResponse } from "next/server"
import admin from "@/lib/firebase-admin"

export async function POST(request) {
  try {
    const { token, title, body, data } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "FCM token is required" }, { status: 400 })
    }

    if (!title || !body) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 })
    }

    // Send the notification
    const messaging = admin.messaging()
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: data || {},
    }

    const response = await messaging.send(message)

    return NextResponse.json({
      success: true,
      messageId: response,
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
