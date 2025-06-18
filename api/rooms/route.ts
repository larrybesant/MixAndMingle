import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { searchParams } = new URL(request.url)
  const genre = searchParams.get("genre")
  const isLive = searchParams.get("live")

  try {
    let query = supabase
      .from("dj_rooms")
      .select(`
        *,
        profiles:host_id (
          username,
          avatar_url,
          full_name
        )
      `)
      .order("created_at", { ascending: false })

    if (genre) {
      query = query.eq("genre", genre)
    }

    if (isLive === "true") {
      query = query.eq("is_live", true)
    }

    const { data: rooms, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error("Error fetching rooms:", error)
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
    const { name, description, genre, tags } = body

    // Validate required fields
    if (!name || !genre) {
      return NextResponse.json({ error: "Name and genre are required" }, { status: 400 })
    }

    const { data: room, error } = await supabase
      .from("dj_rooms")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        genre,
        host_id: session.user.id,
        tags: tags || [],
        is_live: false,
        viewer_count: 0,
      })
      .select(`
        *,
        profiles:host_id (
          username,
          avatar_url,
          full_name
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ room }, { status: 201 })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
