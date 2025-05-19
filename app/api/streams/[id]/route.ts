import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const streamId = params.id
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Get stream details
  const { data: stream, error } = await supabase
    .from("live_streams")
    .select(`
      *,
      dj:dj_id (
        artist_name,
        profiles:id (
          username,
          full_name,
          avatar_url
        )
      )
    `)
    .eq("id", streamId)
    .single()

  if (error || !stream) {
    return NextResponse.json({ error: "Stream not found" }, { status: 404 })
  }

  // Check if stream is live
  if (stream.status !== "live") {
    return NextResponse.json({ error: "Stream is not live" }, { status: 400 })
  }

  return NextResponse.json({ stream })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const streamId = params.id
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Get the request body
  const body = await request.json()
  const { action } = body

  if (action === "join") {
    // Join the stream
    const { error } = await supabase.from("stream_viewers").insert({
      stream_id: streamId,
      user_id: user.id,
    })

    if (error) {
      return NextResponse.json({ error: "Failed to join stream" }, { status: 500 })
    }

    // Update viewer count
    await supabase.rpc("increment_viewer_count", { stream_id: streamId })

    return NextResponse.json({ success: true })
  }

  if (action === "leave") {
    // Leave the stream
    const { error } = await supabase
      .from("stream_viewers")
      .update({ left_at: new Date().toISOString() })
      .eq("stream_id", streamId)
      .eq("user_id", user.id)
      .is("left_at", null)

    if (error) {
      return NextResponse.json({ error: "Failed to leave stream" }, { status: 500 })
    }

    // Update viewer count
    await supabase.rpc("decrement_viewer_count", { stream_id: streamId })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
