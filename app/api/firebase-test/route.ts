import { NextResponse } from "next/server"
import { db } from "@/lib/firebase-admin-safe"

export async function GET() {
  try {
    // Simple test to check if Firebase Admin is working
    const snapshot = await db.collection("system").doc("status").get()

    return NextResponse.json({
      success: true,
      message: "Firebase connection successful",
      exists: snapshot.exists,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Firebase test error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
