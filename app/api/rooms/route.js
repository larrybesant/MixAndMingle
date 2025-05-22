import { NextResponse } from "next/server"
import admin from "@/lib/firebase-admin"

// GET: Fetch all rooms
export async function GET() {
  try {
    const firestore = admin.firestore()
    const roomsSnapshot = await firestore.collection("rooms").get()

    const rooms = roomsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create a new room
export async function POST(request) {
  try {
    const roomData = await request.json()
    const firestore = admin.firestore()

    // Add timestamp
    const roomWithTimestamp = {
      ...roomData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const docRef = await firestore.collection("rooms").add(roomWithTimestamp)

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Room created successfully",
    })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
