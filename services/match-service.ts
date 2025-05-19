import { supabase } from "@/lib/supabase-client"
import type { Match, Profile } from "@/types/database"
import { createNotification } from "./notification-service"
import { getUserGenrePreferences } from "./music-service"

// Get all matches for a user
export async function getMatches(userId: string): Promise<Match[]> {
  if (!userId) return []

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching matches:", error)
    return []
  }

  return data || []
}

// Get match by ID
export async function getMatchById(matchId: string): Promise<Match | null> {
  if (!matchId) return null

  const { data, error } = await supabase.from("matches").select("*").eq("id", matchId).single()

  if (error) {
    console.error("Error fetching match:", error)
    return null
  }

  return data
}

// Create a new match
export async function createMatch(user1Id: string, user2Id: string, matchScore: number): Promise<Match | null> {
  if (!user1Id || !user2Id) return null

  // Ensure user1Id is lexicographically smaller than user2Id for consistency
  const [actualUser1Id, actualUser2Id] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id]

  const { data, error } = await supabase
    .from("matches")
    .insert({
      user1_id: actualUser1Id,
      user2_id: actualUser2Id,
      match_score: matchScore,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating match:", error)
    return null
  }

  return data
}

// Create a match with notifications
export async function createMatchWithNotification(
  user1Id: string,
  user2Id: string,
  matchScore: number,
): Promise<Match | null> {
  // Create the match
  const match = await createMatch(user1Id, user2Id, matchScore)

  if (match) {
    // Get user profiles for notification content
    const { data: user1Profile } = await supabase.from("profiles").select("*").eq("id", user1Id).single()
    const { data: user2Profile } = await supabase.from("profiles").select("*").eq("id", user2Id).single()

    if (user1Profile && user2Profile) {
      // Create notification for user1
      await createNotification(
        user1Id,
        "New Match!",
        `You matched with ${user2Profile.first_name} ${user2Profile.last_name}. Start a conversation!`,
        match.id,
      )

      // Create notification for user2
      await createNotification(
        user2Id,
        "New Match!",
        `You matched with ${user1Profile.first_name} ${user1Profile.last_name}. Start a conversation!`,
        match.id,
      )
    }
  }

  return match
}

// Update match status
export async function updateMatchStatus(matchId: string, status: "accepted" | "rejected"): Promise<Match | null> {
  if (!matchId || !status) return null

  const { data, error } = await supabase
    .from("matches")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId)
    .select()
    .single()

  if (error) {
    console.error("Error updating match status:", error)
    return null
  }

  return data
}

// Get matched profiles for a user
export async function getMatchedProfiles(userId: string): Promise<Profile[]> {
  if (!userId) return []

  // Get all accepted matches for the user
  const { data: matches, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq("status", "accepted")

  if (matchError) {
    console.error("Error fetching matches:", matchError)
    return []
  }

  if (!matches || matches.length === 0) {
    return []
  }

  // Extract the IDs of the matched users
  const matchedUserIds = matches.map((match) => (match.user1_id === userId ? match.user2_id : match.user1_id))

  // Fetch the profiles of the matched users
  const { data: profiles, error: profileError } = await supabase.from("profiles").select("*").in("id", matchedUserIds)

  if (profileError) {
    console.error("Error fetching matched profiles:", profileError)
    return []
  }

  return profiles || []
}

// Get potential matches for a user
export async function getPotentialMatches(
  userId: string,
  limit = 10,
): Promise<{ profile: Profile; matchScore: number }[]> {
  if (!userId) return []

  try {
    // Get user's interests
    const { data: userInterests, error: interestError } = await supabase
      .from("user_interests")
      .select("interest")
      .eq("user_id", userId)

    if (interestError) {
      console.error("Error fetching user interests:", interestError)
      return []
    }

    // Get user's music genre preferences
    const userGenres = await getUserGenrePreferences(userId)
    const userGenreIds = userGenres.map((genre) => genre.id)

    // Get user's music preferences
    const { data: musicPrefs, error: musicError } = await supabase
      .from("user_music_preferences")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (musicError && musicError.code !== "PGRST116") {
      console.error("Error fetching user music preferences:", musicError)
    }

    const interests = userInterests?.map((item) => item.interest) || []

    // Get users who share interests with the current user
    const { data: usersWithSharedInterests, error: userError } = await supabase
      .from("user_interests")
      .select("user_id")
      .in("interest", interests)
      .neq("user_id", userId)

    if (userError) {
      console.error("Error fetching users with shared interests:", userError)
      return []
    }

    // Get users who share music genres with the current user
    const { data: usersWithSharedGenres, error: genreError } = await supabase
      .from("user_genre_preferences")
      .select("user_id")
      .in("genre_id", userGenreIds)
      .neq("user_id", userId)

    if (genreError) {
      console.error("Error fetching users with shared genres:", genreError)
      return []
    }

    // Combine users from both queries
    const potentialUserIds = new Set([
      ...(usersWithSharedInterests?.map((item) => item.user_id) || []),
      ...(usersWithSharedGenres?.map((item) => item.user_id) || []),
    ])

    if (potentialUserIds.size === 0) {
      return []
    }

    // Get existing matches to exclude
    const { data: existingMatches, error: matchError } = await supabase
      .from("matches")
      .select("user1_id, user2_id")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

    if (matchError) {
      console.error("Error fetching existing matches:", matchError)
      return []
    }

    // Extract IDs of users already matched with
    const alreadyMatchedIds = new Set<string>()
    existingMatches?.forEach((match) => {
      if (match.user1_id === userId) {
        alreadyMatchedIds.add(match.user2_id)
      } else {
        alreadyMatchedIds.add(match.user1_id)
      }
    })

    // Filter out users already matched with
    const filteredPotentialMatchIds = Array.from(potentialUserIds).filter((id) => !alreadyMatchedIds.has(id))

    if (filteredPotentialMatchIds.length === 0) {
      return []
    }

    // Fetch profiles of potential matches
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", filteredPotentialMatchIds)
      .limit(limit)

    if (profileError) {
      console.error("Error fetching potential match profiles:", profileError)
      return []
    }

    // Calculate match scores
    const result = await Promise.all(
      profiles.map(async (profile) => {
        // Calculate interest match score
        const { data: matchInterests, error } = await supabase
          .from("user_interests")
          .select("interest")
          .eq("user_id", profile.id)

        if (error) {
          console.error("Error fetching match interests:", error)
          return { profile, matchScore: 0 }
        }

        const matchInterestSet = new Set(matchInterests?.map((item) => item.interest) || [])
        const userInterestSet = new Set(interests)

        // Calculate interest intersection
        const interestIntersection = [...userInterestSet].filter((interest) => matchInterestSet.has(interest))
        const interestScore = interestIntersection.length / Math.max(userInterestSet.size, matchInterestSet.size)

        // Calculate music genre match score
        const { data: matchGenres, error: genreError } = await supabase
          .from("user_genre_preferences")
          .select("genre_id")
          .eq("user_id", profile.id)

        if (genreError) {
          console.error("Error fetching match genres:", genreError)
          return { profile, matchScore: interestScore }
        }

        const matchGenreSet = new Set(matchGenres?.map((item) => item.genre_id) || [])
        const userGenreSet = new Set(userGenreIds)

        // Calculate genre intersection
        const genreIntersection = [...userGenreSet].filter((genreId) => matchGenreSet.has(genreId))
        const genreScore =
          userGenreSet.size > 0 ? genreIntersection.length / Math.max(userGenreSet.size, matchGenreSet.size) : 0

        // Get match's music preferences
        const { data: matchMusicPrefs, error: matchMusicError } = await supabase
          .from("user_music_preferences")
          .select("*")
          .eq("user_id", profile.id)
          .single()

        // Calculate music preference compatibility
        let musicPrefScore = 0.5 // Default middle score
        if (musicPrefs && matchMusicPrefs) {
          // Calculate similarity in music preferences (0-1 scale)
          const mainstreamDiff =
            Math.abs(musicPrefs.mainstream_vs_underground - matchMusicPrefs.mainstream_vs_underground) / 100
          const familiarDiff = Math.abs(musicPrefs.familiar_vs_discover - matchMusicPrefs.familiar_vs_discover) / 100
          const energyDiff = Math.abs(musicPrefs.chill_vs_energetic - matchMusicPrefs.chill_vs_energetic) / 100

          // Average the differences and invert (1 - avg) to get similarity score
          musicPrefScore = 1 - (mainstreamDiff + familiarDiff + energyDiff) / 3
        }

        // Combine scores with weights
        // 40% interests, 40% music genres, 20% music preferences
        const combinedScore = interestScore * 0.4 + genreScore * 0.4 + musicPrefScore * 0.2

        return { profile, matchScore: combinedScore }
      }),
    )

    // Sort by match score (highest first)
    return result.sort((a, b) => b.matchScore - a.matchScore)
  } catch (error) {
    console.error("Error in getPotentialMatches:", error)
    return []
  }
}

// Get profile by ID (helper function)
export async function getProfileById(userId: string): Promise<Profile | null> {
  if (!userId) return null

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

// Check if users are matched
export async function areUsersMatched(user1Id: string, user2Id: string): Promise<boolean> {
  if (!user1Id || !user2Id) return false

  // Ensure consistent ordering of user IDs
  const [smallerId, largerId] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id]

  const { data, error } = await supabase
    .from("matches")
    .select("id")
    .eq("user1_id", smallerId)
    .eq("user2_id", largerId)
    .eq("status", "accepted")
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error checking match status:", error)
  }

  return !!data
}

// Get match count for a user
export async function getUserMatchCount(userId: string): Promise<number> {
  if (!userId) return 0

  const { count, error } = await supabase
    .from("matches")
    .select("id", { count: "exact", head: true })
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq("status", "accepted")

  if (error) {
    console.error("Error getting match count:", error)
    return 0
  }

  return count || 0
}
