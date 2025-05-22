import { NextResponse } from "next/server"
import admin from "@/lib/firebase-admin"

// GET: List users
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const pageToken = searchParams.get("pageToken")

    const auth = admin.auth()
    const listUsersResult = await auth.listUsers(limit, pageToken)

    const users = listUsersResult.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
    }))

    return NextResponse.json({
      users,
      pageToken: listUsersResult.pageToken,
    })
  } catch (error) {
    console.error("Error listing users:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create a new user
export async function POST(request) {
  try {
    const userData = await request.json()
    const auth = admin.auth()

    const user = await auth.createUser(userData)

    return NextResponse.json({
      success: true,
      uid: user.uid,
      message: "User created successfully",
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
