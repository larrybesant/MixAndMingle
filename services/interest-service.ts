import { supabase } from "@/lib/supabase-client"
import type { Interest } from "@/types/database"

export async function getAllInterests(): Promise<Interest[]> {
  const { data, error } = await supabase.from("interests").select("*").order("name")

  if (error) {
    console.error("Error fetching interests:", error)
    return []
  }

  return data || []
}

export async function getUserInterests(userId: string): Promise<string[]> {
  if (!userId) return []

  const { data, error } = await supabase.from("user_interests").select("interest").eq("user_id", userId)

  if (error) {
    console.error("Error fetching user interests:", error)
    return []
  }

  return data?.map((item) => item.interest) || []
}

export async function addUserInterest(userId: string, interest: string): Promise<boolean> {
  if (!userId || !interest) return false

  const { error } = await supabase.from("user_interests").insert({
    user_id: userId,
    interest,
  })

  if (error) {
    console.error("Error adding user interest:", error)
    return false
  }

  return true
}

export async function removeUserInterest(userId: string, interest: string): Promise<boolean> {
  if (!userId || !interest) return false

  const { error } = await supabase.from("user_interests").delete().eq("user_id", userId).eq("interest", interest)

  if (error) {
    console.error("Error removing user interest:", error)
    return false
  }

  return true
}

export async function updateUserInterests(userId: string, interests: string[]): Promise<boolean> {
  if (!userId || !interests) return false

  // First, delete all existing interests
  const { error: deleteError } = await supabase.from("user_interests").delete().eq("user_id", userId)

  if (deleteError) {
    console.error("Error removing user interests:", deleteError)
    return false
  }

  // Then, add the new interests
  if (interests.length > 0) {
    const interestsToInsert = interests.map((interest) => ({
      user_id: userId,
      interest,
    }))

    const { error: insertError } = await supabase.from("user_interests").insert(interestsToInsert)

    if (insertError) {
      console.error("Error adding user interests:", insertError)
      return false
    }
  }

  return true
}

export async function getPopularInterests(limit = 20): Promise<{ interest: string; count: number }[]> {
  const { data, error } = await supabase.rpc("get_popular_interests", { limit_count: limit })

  if (error) {
    console.error("Error fetching popular interests:", error)
    return []
  }

  return data || []
}

export async function getUsersWithSimilarInterests(userId: string, limit = 20): Promise<any[]> {
  if (!userId) return []

  // Get user's interests
  const userInterests = await getUserInterests(userId)

  if (userInterests.length === 0) {
    return []
  }

  // Find users with matching interests
  const { data, error } = await supabase
    .from("user_interests")
    .select("user_id")
    .in("interest", userInterests)
    .neq("user_id", userId)

  if (error) {
    console.error("Error finding users with similar interests:", error)
    return []
  }

  // Count occurrences of each user_id
  const userCounts = data.reduce((acc: Record<string, number>, item) => {
    acc[item.user_id] = (acc[item.user_id] || 0) + 1
    return acc
  }, {})

  // Sort by number of matching interests
  const sortedUserIds = Object.entries(userCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, limit)
    .map(([userId]) => userId)

  if (sortedUserIds.length === 0) {
    return []
  }

  // Get user profiles
  const { data: profiles, error: profileError } = await supabase.from("profiles").select("*").in("id", sortedUserIds)

  if (profileError) {
    console.error("Error fetching profiles with similar interests:", profileError)
    return []
  }

  // Sort profiles in the same order as sortedUserIds
  return sortedUserIds.map((id) => profiles.find((profile) => profile.id === id)).filter(Boolean)
}
