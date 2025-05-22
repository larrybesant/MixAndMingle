import { NextResponse } from "next/server"
import admin from "@/lib/firebase-admin"

// GET: Get user claims
export async function GET(request, { params }) {
  try {
    const { uid } = params
    const auth = admin.auth()
    const user = await auth.getUser(uid)

    return NextResponse.json({
      uid: user.uid,
      customClaims: user.customClaims || {},
    })
  } catch (error) {
    console.error(`Error fetching claims for user ${params.uid}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Set user claims
export async function POST(request, { params }) {
  try {
    const { uid } = params
    const claims = await request.json()
    const auth = admin.auth()

    await auth.setCustomUserClaims(uid, claims)

    return NextResponse.json({
      success: true,
      message: "Custom claims set successfully",
    })
  } catch (error) {
    console.error(`Error setting claims for user ${params.uid}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
