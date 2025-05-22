import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Only return the public VAPID key
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

    if (!vapidKey) {
      return NextResponse.json({ error: "VAPID key not configured" }, { status: 500 })
    }

    return NextResponse.json({ vapidKey })
  } catch (error) {
    console.error("Error fetching VAPID key:", error)
    return NextResponse.json({ error: "Failed to fetch VAPID key" }, { status: 500 })
  }
}
