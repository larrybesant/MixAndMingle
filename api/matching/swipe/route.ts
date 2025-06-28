import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function POST(request: Request) {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { target_user_id, action } = body

    if (!target_user_id || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["like", "pass"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Mock swipe response
    const swipeResult = {
      id: `swipe_${Date.now()}`,
      user_id: user.user.id,
      target_user_id,
      action,
      created_at: new Date().toISOString(),
      is_match: action === "like" && Math.random() > 0.7, // 30% chance of match on like
    }

    // If it's a match, return match data
    if (swipeResult.is_match) {
      const matchData = {
        id: `match_${Date.now()}`,
        user1_id: user.user.id,
        user2_id: target_user_id,
        matched_at: new Date().toISOString(),
        is_active: true,
        other_user: {
          id: target_user_id,
          username: "matched_user",
          full_name: "Matched User",
          avatar_url: null,
          bio: "We matched! Let's chat about music!",
          music_preferences: ["House", "Techno"],
          is_dj: false,
        },
      }

      return NextResponse.json({
        swipe: swipeResult,
        match: matchData,
        message: "It's a match! 🎉",
      })
    }

    return NextResponse.json({
      swipe: swipeResult,
      message: action === "like" ? "Like recorded!" : "Passed!",
    })
  } catch (error) {
    console.error("Swipe error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
