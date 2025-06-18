import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get("roomId")
  const limit = Number.parseInt(searchParams.get("limit") || "50")

  if (!roomId) {
    return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
  }

  try {
    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages: messages.reverse() })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { roomId, message, messageType = "message" } = body

    // Validate required fields
    if (!roomId || !message?.trim()) {
      return NextResponse.json({ error: "Room ID and message are required" }, { status: 400 })
    }

    // Get user profile for username
    const { data: profile } = await supabase.from("profiles").select("username").eq("id", session.user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const { data: chatMessage, error } = await supabase
      .from("chat_messages")
      .insert({
        room_id: roomId,
        user_id: session.user.id,
        username: profile.username,
        message: message.trim(),
        message_type: messageType,
      })
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: chatMessage }, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
