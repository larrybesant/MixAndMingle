import { supabase } from "@/lib/supabase-client"
import type { Match, Profile } from "@/types/database"
import { createNotification } from "./notification-service"

export async function getMatches(userId: string): Promise<Match[]> {
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

export async function getMatchById(matchId: string): Promise<Match | null> {
  const { data, error } = await supabase.from("matches").select("*").eq("id", matchId).single()

  if (error) {
    console.error("Error fetching match:", error)
    return null
  }

  return data
}

export async function createMatch(user1Id: string, user2Id: string, matchScore: number): Promise<Match | null> {
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

export async function createMatchWithNotification(
  user1Id: string,
  user2Id: string,
  matchScore: number,
): Promise<Match | null> {
  // Create the match
  const match = await createMatch(user1Id, user2Id, matchScore)

  if (match) {
    // Get user profiles for notification content
    const user1Profile = await getProfileById(user1Id)
    const user2Profile = await getProfileById(user2Id)

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

export async function updateMatchStatus(matchId: string, status: "accepted" | "rejected"): Promise<Match | null> {
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

export async function getMatchedProfiles(userId: string): Promise<Profile[]> {
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

export async function getPotentialMatches(
  userId: string,
  limit = 10,
): Promise<{ profile: Profile; matchScore: number }[]> {
  // Get user's interests
  const { data: userInterests, error: interestError } = await supabase
    .from("user_interests")
    .select("interest")
    .eq("user_id", userId)

  if (interestError) {
    console.error("Error fetching user interests:", interestError)
    return []
  }

  const interests = userInterests?.map((item) => item.interest) || []

  if (interests.length === 0) {
    return []
  }

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

  if (!usersWithSharedInterests || usersWithSharedInterests.length === 0) {
    return []
  }

  // Get unique user IDs
  const potentialMatchIds = [...new Set(usersWithSharedInterests.map((item) => item.user_id))]

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
  const filteredPotentialMatchIds = potentialMatchIds.filter((id) => !alreadyMatchedIds.has(id))

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

      // Calculate intersection
      const intersection = [...userInterestSet].filter((interest) => matchInterestSet.has(interest))

      // Calculate match score as percentage of shared interests
      const matchScore = intersection.length / Math.max(userInterestSet.size, matchInterestSet.size)

      return { profile, matchScore }
    }),
  )

  // Sort by match score (highest first)
  return result.sort((a, b) => b.matchScore - a.matchScore)
}

async function getProfileById(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}
