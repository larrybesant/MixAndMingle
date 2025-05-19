import { supabase } from "@/lib/supabase-client"

// Get all music genres
export async function getAllGenres() {
  const { data, error } = await supabase.from("music_genres").select("*").order("name")

  if (error) {
    console.error("Error fetching genres:", error)
    return []
  }

  return data || []
}

// Get user's music preferences
export async function getUserMusicPreferences(userId: string) {
  const { data, error } = await supabase.from("user_music_preferences").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    console.error("Error fetching user music preferences:", error)
    return null
  }

  return data
}

// Update user's music preferences
export async function updateUserMusicPreferences(
  userId: string,
  preferences: {
    mainstream_vs_underground?: number
    familiar_vs_discover?: number
    chill_vs_energetic?: number
  },
) {
  const { data, error } = await supabase
    .from("user_music_preferences")
    .upsert(
      {
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select()

  if (error) {
    console.error("Error updating user music preferences:", error)
    return null
  }

  return data
}

// Get user's genre preferences
export async function getUserGenrePreferences(userId: string) {
  const { data, error } = await supabase
    .from("user_genre_preferences")
    .select("genre_id, music_genres(id, name)")
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching user genre preferences:", error)
    return []
  }

  return data?.map((item) => item.music_genres) || []
}

// Add a genre preference for a user
export async function addUserGenrePreference(userId: string, genreId: string) {
  const { error } = await supabase.from("user_genre_preferences").insert({
    user_id: userId,
    genre_id: genreId,
  })

  if (error) {
    console.error("Error adding user genre preference:", error)
    return false
  }

  return true
}

// Remove a genre preference for a user
export async function removeUserGenrePreference(userId: string, genreId: string) {
  const { error } = await supabase.from("user_genre_preferences").delete().eq("user_id", userId).eq("genre_id", genreId)

  if (error) {
    console.error("Error removing user genre preference:", error)
    return false
  }

  return true
}

// Get user's artist preferences
export async function getUserArtistPreferences(userId: string) {
  const { data, error } = await supabase
    .from("user_artist_preferences")
    .select("artist_id, artists(id, name, image_url)")
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching user artist preferences:", error)
    return []
  }

  return data?.map((item) => item.artists) || []
}

// Add an artist preference for a user
export async function addUserArtistPreference(userId: string, artistId: string) {
  const { error } = await supabase.from("user_artist_preferences").insert({
    user_id: userId,
    artist_id: artistId,
  })

  if (error) {
    console.error("Error adding user artist preference:", error)
    return false
  }

  return true
}

// Remove an artist preference for a user
export async function removeUserArtistPreference(userId: string, artistId: string) {
  const { error } = await supabase
    .from("user_artist_preferences")
    .delete()
    .eq("user_id", userId)
    .eq("artist_id", artistId)

  if (error) {
    console.error("Error removing user artist preference:", error)
    return false
  }

  return true
}
