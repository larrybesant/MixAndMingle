import { NextResponse } from "next/server"
import { initializeFirebaseAdmin } from "@/lib/firebase/firebase-admin"
import { getAuth } from "firebase-admin/auth"

export async function POST(request: Request) {
  try {
    const { uid, disabled } = await request.json()

    if (!uid) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Initialize Firebase Admin
    initializeFirebaseAdmin()
    const auth = getAuth()

    // Update user disabled status
    await auth.updateUser(uid, { disabled })

    return NextResponse.json({
      success: true,
      message: `User ${disabled ? "disabled" : "enabled"} successfully`,
    })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
  }
}
