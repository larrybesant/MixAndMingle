import { NextResponse } from "next/server"
import { initializeFirebaseAdmin } from "@/lib/firebase/firebase-admin"
import { redis } from "@/lib/redis/client"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const userId = params.userId

  try {
    // Verify the UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(userId)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    // Check cache first
    const cachedUser = await redis.get(`user:${userId}`)
    if (cachedUser) {
      return NextResponse.json(JSON.parse(cachedUser as string))
    }

    // Get user data from Firebase
    const admin = initializeFirebaseAdmin()
    const userRecord = await admin.auth().getUser(userId)

    // Get additional user data from database if needed
    // const userData = await db.collection("users").doc(userId).get()

    const userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      // Add other user data as needed
    }

    // Cache the user data
    await redis.set(`user:${userId}`, JSON.stringify(userData), { ex: 3600 }) // 1 hour cache

    return NextResponse.json(userData)
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error)
    return NextResponse.json({ error: "Error fetching user data" }, { status: 500 })
  }
}
