import { NextResponse } from "next/server"
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase/firebase-admin"

export async function GET() {
  try {
    // Get Firebase services
    const auth = getFirebaseAuth()
    const firestore = getFirebaseFirestore()

    // Test Firebase Auth
    const userCount = (await auth.listUsers(1)).users.length

    // Test Firestore
    const testDoc = await firestore.collection("test").doc("test").get()

    return NextResponse.json({
      success: true,
      message: "Firebase Admin SDK initialized successfully",
      userCount,
      firestoreTestDoc: testDoc.exists ? "exists" : "does not exist",
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
        message: "Firebase Admin SDK initialization failed",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
