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
  const { data, error } = await supabase.from("user_interests").select("interest").eq("user_id", userId)

  if (error) {
    console.error("Error fetching user interests:", error)
    return []
  }

  return data?.map((item) => item.interest) || []
}

export async function addUserInterest(userId: string, interest: string): Promise<boolean> {
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
  const { error } = await supabase.from("user_interests").delete().eq("user_id", userId).eq("interest", interest)

  if (error) {
    console.error("Error removing user interest:", error)
    return false
  }

  return true
}

export async function updateUserInterests(userId: string, interests: string[]): Promise<boolean> {
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
