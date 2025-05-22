import { NextResponse } from "next/server"
import admin from "@/lib/firebase-admin"

export async function GET() {
  try {
    // Test Firebase Auth
    const auth = admin.auth()
    const userCount = (await auth.listUsers(1)).users.length

    // Test Firestore
    const firestore = admin.firestore()
    const testCollection = await firestore.collection("test").limit(1).get()

    return NextResponse.json({
      success: true,
      message: "Firebase Admin SDK is working",
      userCount,
      collectionSize: testCollection.size,
      environment: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        hasDatabaseUrl: !!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      },
    })
  } catch (error) {
    console.error("Firebase test failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Firebase Admin SDK test failed",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
