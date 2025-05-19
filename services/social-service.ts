import { supabase } from "@/utils/supabase-client"

// Follow a DJ
export async function followDj(userId: string, djId: string) {
  if (!userId || !djId) return null

  const { data, error } = await supabase
    .from("dj_followers")
    .insert({
      user_id: userId,
      dj_id: djId,
    })
    .select()

  if (error) {
    console.error("Error following DJ:", error)
    throw new Error("Failed to follow DJ")
  }

  return data
}

// Unfollow a DJ
export async function unfollowDj(userId: string, djId: string) {
  if (!userId || !djId) return null

  const { data, error } = await supabase.from("dj_followers").delete().eq("user_id", userId).eq("dj_id", djId).select()

  if (error) {
    console.error("Error unfollowing DJ:", error)
    throw new Error("Failed to unfollow DJ")
  }

  return data
}

// Check if user is following a DJ
export async function isFollowingDj(userId: string, djId: string): Promise<boolean> {
  if (!userId || !djId) return false

  const { data, error } = await supabase
    .from("dj_followers")
    .select("id")
    .eq("user_id", userId)
    .eq("dj_id", djId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // No rows found
      return false
    }
    console.error("Error checking if following DJ:", error)
    throw new Error("Failed to check follow status")
  }

  return !!data
}

// Get followers of a DJ
export async function getDjFollowers(djId: string) {
  if (!djId) return []

  const { data, error } = await supabase
    .from("dj_followers")
    .select(
      `
      *,
      profiles(id, first_name, last_name, avatar_url, username)
    `,
    )
    .eq("dj_id", djId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error getting DJ followers:", error)
    throw new Error("Failed to get followers")
  }

  return data || []
}

// Get DJs followed by a user
export async function getFollowedDjs(userId: string) {
  if (!userId) return []

  const { data, error } = await supabase
    .from("dj_followers")
    .select(
      `
      *,
      dj_profiles(id, artist_name, bio, experience_years, hourly_rate, profiles(id, first_name, last_name, avatar_url))
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error getting followed DJs:", error)
    throw new Error("Failed to get followed DJs")
  }

  return data || []
}

// Get follower count for a DJ
export async function getDjFollowerCount(djId: string): Promise<number> {
  if (!djId) return 0

  const { count, error } = await supabase
    .from("dj_followers")
    .select("id", { count: "exact", head: true })
    .eq("dj_id", djId)

  if (error) {
    console.error("Error getting DJ follower count:", error)
    throw new Error("Failed to get follower count")
  }

  return count || 0
}

// Get following count for a user
export async function getUserFollowingCount(userId: string): Promise<number> {
  if (!userId) return 0

  const { count, error } = await supabase
    .from("dj_followers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)

  if (error) {
    console.error("Error getting user following count:", error)
    throw new Error("Failed to get following count")
  }

  return count || 0
}

// Get social feed for a user
export async function getUserSocialFeed(userId: string, limit = 20) {
  if (!userId) return []

  try {
    // Get DJs followed by the user
    const { data: followedDjs, error: followError } = await supabase
      .from("dj_followers")
      .select("dj_id")
      .eq("user_id", userId)

    if (followError) {
      console.error("Error getting followed DJs:", followError)
      return []
    }

    if (!followedDjs || followedDjs.length === 0) {
      return []
    }

    const djIds = followedDjs.map((item) => item.dj_id)

    // Get recent streams from followed DJs
    const { data: streams, error: streamError } = await supabase
      .from("live_streams")
      .select(`
        *,
        dj_profiles(id, artist_name, user_id, profiles(id, first_name, last_name, avatar_url))
      `)
      .in("dj_id", djIds)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (streamError) {
      console.error("Error getting DJ streams:", streamError)
      return []
    }

    return streams || []
  } catch (error) {
    console.error("Error in getUserSocialFeed:", error)
    return []
  }
}
