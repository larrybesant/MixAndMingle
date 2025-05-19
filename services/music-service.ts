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
  if (!userId) return null

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
  if (!userId || !preferences) return null

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
  if (!userId) return []

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
  if (!userId || !genreId) return false

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
  if (!userId || !genreId) return false

  const { error } = await supabase.from("user_genre_preferences").delete().eq("user_id", userId).eq("genre_id", genreId)

  if (error) {
    console.error("Error removing user genre preference:", error)
    return false
  }

  return true
}

// Get user's artist preferences
export async function getUserArtistPreferences(userId: string) {
  if (!userId) return []

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
  if (!userId || !artistId) return false

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
  if (!userId || !artistId) return false

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

// Get recommended music based on user preferences
export async function getMusicRecommendations(userId: string, limit = 10) {
  if (!userId) return []

  try {
    // Get user's genre preferences
    const userGenres = await getUserGenrePreferences(userId)
    const genreIds = userGenres.map((genre) => genre.id)

    if (genreIds.length === 0) {
      // If user has no genre preferences, return popular tracks
      return getPopularTracks(limit)
    }

    // Get tracks in user's preferred genres
    const { data, error } = await supabase
      .from("tracks")
      .select(`
        *,
        artists(id, name, image_url),
        genre_id,
        music_genres(id, name)
      `)
      .in("genre_id", genreIds)
      .limit(limit)

    if (error) {
      console.error("Error fetching music recommendations:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getMusicRecommendations:", error)
    return []
  }
}

// Get popular tracks
export async function getPopularTracks(limit = 10) {
  try {
    const { data, error } = await supabase
      .from("tracks")
      .select(`
        *,
        artists(id, name, image_url),
        genre_id,
        music_genres(id, name)
      `)
      .order("play_count", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching popular tracks:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getPopularTracks:", error)
    return []
  }
}
