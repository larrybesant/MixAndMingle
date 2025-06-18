import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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
    const { username, full_name, bio, music_preferences, avatar_url } = body

    // Validate username uniqueness if provided
    if (username) {
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", session.user.id)
        .single()

      if (existingUser) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 })
      }
    }

    const updateData: any = { updated_at: new Date().toISOString() }

    if (username !== undefined) updateData.username = username
    if (full_name !== undefined) updateData.full_name = full_name
    if (bio !== undefined) updateData.bio = bio
    if (music_preferences !== undefined) updateData.music_preferences = music_preferences
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", session.user.id)
      .select("*")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
