import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")
  const recipientId = url.searchParams.get("recipientId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    let query = supabase
      .from("direct_messages")
      .select(`
        *,
        sender:sender_id (id, username, avatar_url),
        recipient:recipient_id (id, username, avatar_url)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (recipientId) {
      query = query.or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages: data })
  } catch (error) {
    console.error("Error fetching direct messages:", error)
    return NextResponse.json({ error: "Failed to fetch direct messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const { sender_id, recipient_id, content, attachment_url, attachment_type, is_voice_message } = await request.json()

    if (!sender_id || !recipient_id || !content) {
      return NextResponse.json({ error: "Sender ID, recipient ID, and content are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("direct_messages")
      .insert([
        {
          sender_id,
          recipient_id,
          content,
          attachment_url: attachment_url || null,
          attachment_type: attachment_type || null,
          is_voice_message: is_voice_message || false,
          is_read: false,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: data }, { status: 201 })
  } catch (error) {
    console.error("Error creating direct message:", error)
    return NextResponse.json({ error: "Failed to create direct message" }, { status: 500 })
  }
}
