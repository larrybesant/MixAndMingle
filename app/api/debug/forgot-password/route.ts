import { type NextRequest, NextResponse } from "next/server"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

// Initialize Firebase Admin if not already initialized
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

    if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error("Missing Firebase Admin credentials")
    }

    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    })
  }

  return { auth: getAuth() }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Log the attempt
    console.log(`Server-side password reset attempt for: ${email}`)

    // Initialize Firebase Admin
    const { auth } = initializeFirebaseAdmin()

    // Generate password reset link
    const link = await auth.generatePasswordResetLink(email)

    // In a real implementation, you might send this link via email
    // For debugging, we'll just return it

    return NextResponse.json({
      success: true,
      message: "Password reset link generated successfully",
      // Only include partial link for security
      linkPreview: `${link.substring(0, 30)}...`,
    })
  } catch (error: any) {
    console.error("Password reset error:", error)

    return NextResponse.json(
      {
        error: error.message || "Failed to process password reset",
        code: error.code,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
