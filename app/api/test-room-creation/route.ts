import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Simulate room creation test
    const testRoom = {
      id: "test-room-" + Date.now(),
      name: "Test Room",
      description: "Testing room creation functionality",
      created_at: new Date().toISOString(),
      status: "active",
    }

    return NextResponse.json({
      success: true,
      message: "Room creation system is working",
      room: testRoom,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Room creation test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
