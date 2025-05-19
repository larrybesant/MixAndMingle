import { supabase } from "@/lib/supabase-client"

// Check if a user has a DJ profile
export async function hasDjProfile(userId: string) {
  const { data, error } = await supabase.from("dj_profiles").select("id").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    console.error("Error checking DJ profile:", error)
    return false
  }

  return !!data
}

// Get a DJ profile by user ID
export async function getDjProfileByUserId(userId: string) {
  const { data, error } = await supabase.from("dj_profiles").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching DJ profile:", error)
    return null
  }

  return data
}

// Create or update a DJ profile
export async function upsertDjProfile(
  userId: string,
  profile: {
    artist_name: string
    bio?: string
    experience_years?: number
    hourly_rate?: number
  },
) {
  const { data, error } = await supabase
    .from("dj_profiles")
    .upsert(
      {
        user_id: userId,
        ...profile,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select()

  if (error) {
    console.error("Error upserting DJ profile:", error)
    return null
  }

  return data
}

// Get DJ genres
export async function getDjGenres(djId: string) {
  const { data, error } = await supabase.from("dj_genres").select("genre_id, music_genres(id, name)").eq("dj_id", djId)

  if (error) {
    console.error("Error fetching DJ genres:", error)
    return []
  }

  return data?.map((item) => item.music_genres) || []
}

// Add a genre to a DJ profile
export async function addDjGenre(djId: string, genreId: string) {
  const { error } = await supabase.from("dj_genres").insert({
    dj_id: djId,
    genre_id: genreId,
  })

  if (error) {
    console.error("Error adding DJ genre:", error)
    return false
  }

  return true
}

// Remove a genre from a DJ profile
export async function removeDjGenre(djId: string, genreId: string) {
  const { error } = await supabase.from("dj_genres").delete().eq("dj_id", djId).eq("genre_id", genreId)

  if (error) {
    console.error("Error removing DJ genre:", error)
    return false
  }

  return true
}

// Get all DJ profiles
export async function getAllDjProfiles() {
  const { data, error } = await supabase
    .from("dj_profiles")
    .select(
      `
      *,
      profiles(id, first_name, last_name, avatar_url)
    `,
    )
    .order("artist_name")

  if (error) {
    console.error("Error fetching DJ profiles:", error)
    return []
  }

  return data || []
}

// Get DJ profile by ID
export async function getDjProfileById(djId: string) {
  const { data, error } = await supabase
    .from("dj_profiles")
    .select(
      `
      *,
      profiles(id, first_name, last_name, avatar_url)
    `,
    )
    .eq("id", djId)
    .single()

  if (error) {
    console.error("Error fetching DJ profile:", error)
    return null
  }

  return data
}
