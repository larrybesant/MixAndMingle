import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { userId, isOnline } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Update user document
    await db.collection("users").doc(userId).update({
      isOnline,
      lastSeen: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating online status:", error)
    return NextResponse.json({ error: "Failed to update online status" }, { status: 500 })
  }
}
