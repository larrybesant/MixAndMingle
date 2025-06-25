import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, return mock data until we set up the database tables
    const mockMatches = [
      {
        id: "1",
        username: "DJ_Alex",
        full_name: "Alex Johnson",
        avatar_url: null,
        bio: "Electronic music producer and DJ. Love house and techno!",
        music_preferences: ["House", "Techno", "Electronic"],
        is_dj: true,
        age: 26,
      },
      {
        id: "2",
        username: "musiclover23",
        full_name: "Sarah Chen",
        avatar_url: null,
        bio: "Always looking for new music and great vibes ✨",
        music_preferences: ["Pop", "R&B", "Hip-Hop"],
        is_dj: false,
        age: 24,
      },
      {
        id: "3",
        username: "beatdropper",
        full_name: "Mike Rodriguez",
        avatar_url: null,
        bio: "Producer, DJ, and music enthusiast. Let's create something amazing together!",
        music_preferences: ["EDM", "Dubstep", "Trap"],
        is_dj: true,
        age: 29,
      },
    ];

    return NextResponse.json({ matches: mockMatches });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
