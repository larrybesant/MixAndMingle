import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if all required environment variables are set
    const envVars = {
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
        ? `${process.env.FIREBASE_PRIVATE_KEY.substring(0, 20)}...${process.env.FIREBASE_PRIVATE_KEY.substring(process.env.FIREBASE_PRIVATE_KEY.length - 20)}`
        : undefined,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    }

    // Check for missing environment variables
    const missingVars = Object.entries(envVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required environment variables",
          missingVars,
        },
        { status: 500 },
      )
    }

    // Check if private key is properly formatted
    const privateKey = process.env.FIREBASE_PRIVATE_KEY || ""
    const hasBeginMarker = privateKey.includes("BEGIN PRIVATE KEY")
    const hasEndMarker = privateKey.includes("END PRIVATE KEY")
    const hasNewlines = privateKey.includes("\n") || privateKey.includes("\\n")

    const keyFormatIssues = []
    if (!hasBeginMarker) keyFormatIssues.push("Missing BEGIN PRIVATE KEY marker")
    if (!hasEndMarker) keyFormatIssues.push("Missing END PRIVATE KEY marker")
    if (!hasNewlines) keyFormatIssues.push("Missing newlines in private key")

    if (keyFormatIssues.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Private key format issues detected",
          keyFormatIssues,
          envVars,
        },
        { status: 500 },
      )
    }

    // Try to initialize Firebase Admin
    const { initializeFirebaseAdmin } = await import("@/lib/firebase/firebase-admin")
    const { auth } = initializeFirebaseAdmin()

    // Try a simple operation
    const userCount = (await auth.listUsers(1)).users.length

    return NextResponse.json({
      success: true,
      message: "Firebase Admin SDK initialized successfully",
      userCount,
      envVars,
    })
  } catch (error) {
    console.error("Firebase Admin debug failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Firebase Admin SDK initialization failed",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
