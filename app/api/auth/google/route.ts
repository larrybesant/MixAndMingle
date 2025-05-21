import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/firebase-admin-safe"

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken)

    // Create a custom token for the user
    const customToken = await auth.createCustomToken(decodedToken.uid)

    return NextResponse.json({
      success: true,
      token: customToken,
    })
  } catch (error: any) {
    console.error("Google auth error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
