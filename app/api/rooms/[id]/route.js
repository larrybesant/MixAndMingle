import { NextResponse } from "next/server"
import admin from "@/lib/firebase-admin"

// GET: Fetch a specific room
export async function GET(request, { params }) {
  try {
    const { id } = params
    const firestore = admin.firestore()
    const roomDoc = await firestore.collection("rooms").doc(id).get()

    if (!roomDoc.exists) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: roomDoc.id,
      ...roomDoc.data(),
    })
  } catch (error) {
    console.error(`Error fetching room ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Update a room
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const updateData = await request.json()
    const firestore = admin.firestore()

    // Add update timestamp
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    await firestore.collection("rooms").doc(id).update(dataWithTimestamp)

    return NextResponse.json({
      success: true,
      message: "Room updated successfully",
    })
  } catch (error) {
    console.error(`Error updating room ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Delete a room
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const firestore = admin.firestore()
    await firestore.collection("rooms").doc(id).delete()

    return NextResponse.json({
      success: true,
      message: "Room deleted successfully",
    })
  } catch (error) {
    console.error(`Error deleting room ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
