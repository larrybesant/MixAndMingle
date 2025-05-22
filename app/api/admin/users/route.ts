import { NextResponse } from "next/server"
import { initializeFirebaseAdmin } from "@/lib/firebase/firebase-admin"
import { getAuth } from "firebase-admin/auth"

export async function GET() {
  try {
    // Initialize Firebase Admin
    initializeFirebaseAdmin()
    const auth = getAuth()

    // List all users (paginated)
    // Note: In production, you should implement pagination
    const listUsersResult = await auth.listUsers(1000)

    const users = listUsersResult.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      disabled: user.disabled,
      emailVerified: user.emailVerified,
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime,
      customClaims: user.customClaims || {},
    }))

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
