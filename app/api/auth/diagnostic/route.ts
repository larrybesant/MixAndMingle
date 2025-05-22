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
    const envVars = {
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    }

    // Initialize Firebase Admin
    const { success, error, auth } = initializeFirebaseAdmin()

    // Test Firebase Admin functionality
    let userCount = 0
    let authFunctional = false
    let testError = null

    if (success && auth) {
      try {
        // List first 10 users
        const listUsersResult = await auth.listUsers(10)
        userCount = listUsersResult.users.length
        authFunctional = true
      } catch (err: any) {
        testError = err.message
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      firebase: {
        adminInitialized: success,
        adminError: error || null,
        authFunctional,
        userCount,
        testError,
      },
      envVars,
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
      nextVersion: process.env.NEXT_PUBLIC_APP_VERSION,
    })
  } catch (error: any) {
    console.error("Diagnostic error:", error)
    return NextResponse.json(
      {
        error: "Diagnostic failed",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
