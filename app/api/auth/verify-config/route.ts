import { NextResponse } from "next/server"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

// Initialize Firebase Admin if not already initialized
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
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

      return { success: true, auth: getAuth() }
    } catch (error: any) {
      console.error("Firebase Admin initialization error:", error)
      return {
        success: false,
        error: error.message,
        auth: null,
      }
    }
  }

  return { success: true, auth: getAuth() }
}

export async function GET() {
  try {
    // Check environment variables
    const requiredEnvVars = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_PRIVATE_KEY",
    ]

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    // Initialize Firebase Admin
    const { success, error, auth } = initializeFirebaseAdmin()

    // Test Firebase Auth configuration
    let authStatus = "unknown"
    let testError = null
    let userSample = []

    if (success && auth) {
      try {
        // List first 5 users
        const listUsersResult = await auth.listUsers(5)
        userSample = listUsersResult.users.map((user) => ({
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          disabled: user.disabled,
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
        }))
        authStatus = "functional"
      } catch (err: any) {
        testError = err.message
        authStatus = "error"
      }
    } else {
      authStatus = "initialization_failed"
    }

    return NextResponse.json({
      configStatus: missingVars.length === 0 ? "complete" : "incomplete",
      missingEnvVars: missingVars,
      firebaseAdmin: {
        initialized: success,
        error: error || null,
        authStatus,
        testError,
      },
      userSample: process.env.NODE_ENV === "development" ? userSample : "Redacted in production",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Config verification error:", error)
    return NextResponse.json(
      {
        error: "Verification failed",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
