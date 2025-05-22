import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId, token, platform } = await request.json()

    // Validate request
    if (!userId || !token) {
      return NextResponse.json({ error: "User ID and token are required" }, { status: 400 })
    }

    // Register token with user
    await db.user.update({
      where: { id: userId },
      data: {
        deviceTokens: {
          push: {
            token,
            platform: platform || "web",
            lastUpdated: new Date(),
          },
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error registering notification token:", error)
    return NextResponse.json({ error: "Failed to register token" }, { status: 500 })
  }
}
