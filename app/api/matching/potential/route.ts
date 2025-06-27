import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET() {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock potential matches data
    const mockPotentialMatches = [
      {
        id: "3",
        username: "beatmaster",
        full_name: "Mike Rodriguez",
        avatar_url: null,
        bio: "Techno DJ from Berlin. Love underground beats and late night sets!",
        music_preferences: ["Techno", "House", "Minimal"],
        is_dj: true,
        age: 28,
        location: "Berlin, Germany",
        distance: 5.2,
        compatibility_score: 92,
        mutual_friends: 3,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "4",
        username: "musicfan",
        full_name: "Emma Thompson",
        avatar_url: null,
        bio: "Music enthusiast who loves discovering new artists and going to live shows!",
        music_preferences: ["Indie", "Alternative", "Electronic"],
        is_dj: false,
        age: 25,
        location: "Los Angeles, CA",
        distance: 2.8,
        compatibility_score: 87,
        mutual_friends: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "5",
        username: "vinylcollector",
        full_name: "David Kim",
        avatar_url: null,
        bio: "Vinyl collector and house music lover. Always looking for rare finds!",
        music_preferences: ["House", "Disco", "Funk"],
        is_dj: false,
        age: 32,
        location: "New York, NY",
        distance: 8.1,
        compatibility_score: 79,
        mutual_friends: 0,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ]

    return NextResponse.json({ potential_matches: mockPotentialMatches })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
