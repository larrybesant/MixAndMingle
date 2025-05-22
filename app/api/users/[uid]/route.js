import { NextResponse } from "next/server"
import admin from "@/lib/firebase-admin"

// GET: Get a specific user
export async function GET(request, { params }) {
  try {
    const { uid } = params
    const auth = admin.auth()
    const user = await auth.getUser(uid)

    return NextResponse.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      customClaims: user.customClaims,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
    })
  } catch (error) {
    console.error(`Error fetching user ${params.uid}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Update a user
export async function PUT(request, { params }) {
  try {
    const { uid } = params
    const updateData = await request.json()
    const auth = admin.auth()

    await auth.updateUser(uid, updateData)

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error(`Error updating user ${params.uid}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Delete a user
export async function DELETE(request, { params }) {
  try {
    const { uid } = params
    const auth = admin.auth()
    await auth.deleteUser(uid)

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error(`Error deleting user ${params.uid}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
