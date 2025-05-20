import { NextResponse } from "next/server"
import { getMessaging } from "firebase-admin/messaging"
import { db } from "@/lib/firebase-admin"
import { initAdmin } from "@/lib/firebase-admin"

// Initialize Firebase Admin
initAdmin()

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // Get the FCM instance
    const messaging = getMessaging()

    // Generate a registration token
    // This is a server-side operation that uses the VAPID key securely
    const token = await messaging.createRegistrationToken()

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

    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error("Error registering FCM token:", error)

    return NextResponse.json(
      { error: "Failed to register FCM token", details: (error as Error).message },
      { status: 500 },
    )
  }
}
