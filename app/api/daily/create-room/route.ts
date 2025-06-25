import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, privacy = "public" } = await request.json()

    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name,
        privacy,
        properties: {
          max_participants: 50,
          enable_chat: true,
          enable_screenshare: true,
          enable_recording: false,
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create Daily room")
    }

    const room = await response.json()

    return NextResponse.json({
      success: true,
      room: {
        url: room.url,
        name: room.name,
        id: room.id,
      },
    })
  } catch (error) {
    console.error("Error creating Daily room:", error)
    return NextResponse.json({ success: false, error: "Failed to create room" }, { status: 500 })
  }
}
