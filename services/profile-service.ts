import { supabase } from "@/lib/supabase-client"
import type { Profile } from "@/types/database"

// Get profile by ID
export async function getProfileById(userId: string): Promise<Profile | null> {
  if (!userId) return null

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

// Update profile
export async function updateProfile(userId: string, profile: Partial<Profile>): Promise<Profile | null> {
  if (!userId || !profile) return null

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating profile:", error)
    return null
  }

  return data
}

// Create profile
export async function createProfile(userId: string, profile: Partial<Profile>): Promise<Profile | null> {
  if (!userId || !profile) return null

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      ...profile,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating profile:", error)
    return null
  }

  return data
}

// Get profiles by IDs
export async function getProfilesByIds(userIds: string[]): Promise<Profile[]> {
  if (!userIds || userIds.length === 0) return []

  const { data, error } = await supabase.from("profiles").select("*").in("id", userIds)

  if (error) {
    console.error("Error fetching profiles:", error)
    return []
  }

  return data || []
}

// Search profiles
export async function searchProfiles(query: string, limit = 20): Promise<Profile[]> {
  if (!query) return []

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,username.ilike.%${query}%`)
    .limit(limit)

  if (error) {
    console.error("Error searching profiles:", error)
    return []
  }

  return data || []
}

// Check if username exists
export async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!username) return false

  const { data, error } = await supabase.from("profiles").select("id").eq("username", username).single()

  if (error && error.code === "PGRST116") {
    // PGRST116 is "no rows returned", meaning username is available
    return true
  }

  return false
}

// Get profile by username
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  if (!username) return null

  const { data, error } = await supabase.from("profiles").select("*").eq("username", username).single()

  if (error) {
    console.error("Error fetching profile by username:", error)
    return null
  }

  return data
}
