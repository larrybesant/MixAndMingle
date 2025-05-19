import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const url = new URL(request.url)
  const roomId = url.searchParams.get("roomId")

  if (!roomId) {
    return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select(`
        *,
        profiles:sender_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages: data })
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return NextResponse.json({ error: "Failed to fetch chat messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const { room_id, content, sender_id } = await request.json()

    if (!room_id || !content || !sender_id) {
      return NextResponse.json({ error: "Room ID, content, and sender ID are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .insert([
        {
          room_id,
          content,
          sender_id,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: data }, { status: 201 })
  } catch (error) {
    console.error("Error creating chat message:", error)
    return NextResponse.json({ error: "Failed to create chat message" }, { status: 500 })
  }
}
