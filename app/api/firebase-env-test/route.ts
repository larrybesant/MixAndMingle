import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if all required environment variables are set
    const envVars = {
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ Set" : "❌ Missing",
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? "✅ Set" : "❌ Missing",
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? "✅ Set" : "❌ Missing",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✅ Set" : "❌ Missing",
      NEXT_PUBLIC_FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ? "✅ Set" : "❌ Missing",
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ Set" : "❌ Missing",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅ Set" : "❌ Missing",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
        ? "✅ Set"
        : "❌ Missing",
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✅ Set" : "❌ Missing",
    }

    // Check private key format
    let privateKeyStatus = "❌ Invalid format"
    if (process.env.FIREBASE_PRIVATE_KEY) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
      if (privateKey.includes("BEGIN PRIVATE KEY") && privateKey.includes("END PRIVATE KEY")) {
        privateKeyStatus = "✅ Valid format"
      }
    }

    return NextResponse.json({
      success: true,
      message: "Environment variables check",
      envVars,
      privateKeyStatus,
    })
  } catch (error) {
    console.error("Environment variables check failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Environment variables check failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
