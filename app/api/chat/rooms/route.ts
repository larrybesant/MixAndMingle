import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase.from("chat_rooms").select("*").order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rooms: data })
  } catch (error) {
    console.error("Error fetching chat rooms:", error)
    return NextResponse.json({ error: "Failed to fetch chat rooms" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const { name, event_id } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("chat_rooms")
      .insert([
        {
          name,
          event_id: event_id || null,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ room: data }, { status: 201 })
  } catch (error) {
    console.error("Error creating chat room:", error)
    return NextResponse.json({ error: "Failed to create chat room" }, { status: 500 })
  }
}
