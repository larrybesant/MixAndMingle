import { supabase } from "@/lib/supabase-client"

// Get DJ profile by user ID
export async function getDjProfileByUserId(userId: string) {
  if (!userId) return null

  const { data, error } = await supabase
    .from("dj_profiles")
    .select(
      `
      *,
      profiles(id, first_name, last_name, avatar_url)
    `,
    )
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      console.error("Error fetching DJ profile:", error)
    }
    return null
  }

  return data
}

// Check if a user has a DJ profile
export async function hasDjProfile(userId: string): Promise<boolean> {
  if (!userId) return false

  const { data, error } = await supabase.from("dj_profiles").select("id").eq("user_id", userId).single()

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("Error checking DJ profile:", error)
    }
    return false
  }

  return !!data
}

// Get DJ profile by ID
export async function getDjProfileById(djId: string) {
  if (!djId) return null

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

// Create a DJ profile
export async function createDjProfile(
  userId: string,
  profile: {
    artist_name: string
    bio?: string
    experience_years?: number
    hourly_rate?: number
  },
) {
  if (!userId || !profile || !profile.artist_name) return null

  const { data, error } = await supabase
    .from("dj_profiles")
    .insert({
      user_id: userId,
      ...profile,
    })
    .select()

  if (error) {
    console.error("Error creating DJ profile:", error)
    return null
  }

  return data
}

// Update a DJ profile
export async function updateDjProfile(
  djId: string,
  profile: {
    artist_name?: string
    bio?: string
    experience_years?: number
    hourly_rate?: number
  },
) {
  if (!djId || !profile) return null

  const { data, error } = await supabase
    .from("dj_profiles")
    .update({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .eq("id", djId)
    .select()

  if (error) {
    console.error("Error updating DJ profile:", error)
    return null
  }

  return data
}

// Get DJ genres
export async function getDjGenres(djId: string) {
  if (!djId) return []

  const { data, error } = await supabase
    .from("dj_genres")
    .select(
      `
      *,
      music_genres(id, name, description)
    `,
    )
    .eq("dj_id", djId)

  if (error) {
    console.error("Error fetching DJ genres:", error)
    return []
  }

  return data || []
}

// Add a genre to a DJ profile
export async function addDjGenre(djId: string, genreId: string) {
  if (!djId || !genreId) return null

  const { data, error } = await supabase
    .from("dj_genres")
    .insert({
      dj_id: djId,
      genre_id: genreId,
    })
    .select()

  if (error) {
    console.error("Error adding DJ genre:", error)
    return null
  }

  return data
}

// Remove a genre from a DJ profile
export async function removeDjGenre(djId: string, genreId: string) {
  if (!djId || !genreId) return null

  const { data, error } = await supabase.from("dj_genres").delete().eq("dj_id", djId).eq("genre_id", genreId).select()

  if (error) {
    console.error("Error removing DJ genre:", error)
    return null
  }

  return data
}

// Get popular DJs
export async function getPopularDjs(limit = 10) {
  const { data, error } = await supabase
    .from("dj_profiles")
    .select(`
      *,
      profiles(id, first_name, last_name, avatar_url),
      followers:dj_followers(count)
    `)
    .order("followers", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching popular DJs:", error)
    return []
  }

  return data || []
}

// Search DJs
export async function searchDjs(query: string, limit = 20) {
  if (!query) return []

  const { data, error } = await supabase
    .from("dj_profiles")
    .select(`
      *,
      profiles(id, first_name, last_name, avatar_url)
    `)
    .or(`artist_name.ilike.%${query}%,bio.ilike.%${query}%`)
    .limit(limit)

  if (error) {
    console.error("Error searching DJs:", error)
    return []
  }

  return data || []
}
