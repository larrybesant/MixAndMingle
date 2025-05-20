import { NextResponse } from "next/server"
import { db } from "@/lib/firebase-admin-safe"

export async function POST(request: Request) {
  try {
    const { userId, token } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    // In a build environment, just return success
    if (process.env.NODE_ENV === "production" && !process.env.VERCEL_URL) {
      return NextResponse.json({ success: true, message: "Build-time mock response" })
    }

    // Save token to user's document
    const userRef = db.collection("users").doc(userId)
    const userDoc = await userRef.get()

    if (userDoc.exists) {
      const userData = userDoc.data()
      const tokens = userData?.fcmTokens || []

      // Only add token if it doesn't exist
      if (!tokens.includes(token)) {
        await userRef.update({
          fcmTokens: [...tokens, token],
        })
      }
    } else {
      await userRef.set(
        {
          fcmTokens: [token],
        },
        { merge: true },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error registering FCM token:", error)

    return NextResponse.json(
      { error: "Failed to register FCM token", details: (error as Error).message },
      { status: 500 },
    )
  }
}
