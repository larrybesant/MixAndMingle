import { NextResponse } from "next/server"
import admin from "@/lib/firebase-admin"

export async function POST(request) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ error: "ID token is required" }, { status: 400 })
    }

    // Verify the ID token
    const auth = admin.auth()
    const decodedToken = await auth.verifyIdToken(idToken)

    // Get the user
    const user = await auth.getUser(decodedToken.uid)

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      },
    })
  } catch (error) {
    console.error("Error verifying token:", error)

    return NextResponse.json({ error: "Invalid token", message: error.message }, { status: 401 })
  }
}
