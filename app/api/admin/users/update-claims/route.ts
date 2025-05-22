import { NextResponse } from "next/server"
import { initializeFirebaseAdmin } from "@/lib/firebase/firebase-admin"
import { getAuth } from "firebase-admin/auth"

export async function POST(request: Request) {
  try {
    const { uid, claims } = await request.json()

    if (!uid) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Initialize Firebase Admin
    initializeFirebaseAdmin()
    const auth = getAuth()

    // Get current custom claims
    const user = await auth.getUser(uid)
    const currentClaims = user.customClaims || {}

    // Update custom claims
    const updatedClaims = { ...currentClaims, ...claims }
    await auth.setCustomUserClaims(uid, updatedClaims)

    return NextResponse.json({
      success: true,
      message: "User claims updated successfully",
      updatedClaims,
    })
  } catch (error) {
    console.error("Error updating user claims:", error)
    return NextResponse.json({ error: "Failed to update user claims" }, { status: 500 })
  }
}
