import { NextResponse } from "next/server"

export async function GET() {
  // Only use the server-side environment variable
  const vapidKey = process.env.FIREBASE_VAPID_KEY

  // Only return the VAPID key if it exists
  if (!vapidKey) {
    return NextResponse.json({ error: "VAPID key not configured" }, { status: 500 })
  }

  return NextResponse.json({
    vapidKey: vapidKey,
  })
}
