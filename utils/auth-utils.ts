import { supabase } from "@/utils/supabase-client"
import type { Session } from "@supabase/supabase-js"

/**
 * Checks if a user is authenticated
 * @returns The user session or null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<Session | null> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Auth error:", error)
      return null
    }

    return session
  } catch (error) {
    console.error("Error checking authentication:", error)
    return null
  }
}

/**
 * Checks if a user is authorized to access a resource
 * @param userId The user ID to check
 * @param resourceType The type of resource (e.g., 'stream', 'profile')
 * @param resourceId The ID of the resource
 * @param action The action being performed (e.g., 'read', 'update', 'delete')
 * @returns Whether the user is authorized
 */
export async function isAuthorized(
  userId: string | undefined,
  resourceType: string,
  resourceId: string,
  action: "read" | "create" | "update" | "delete",
): Promise<boolean> {
  if (!userId) return false

  try {
    // Check if user is an admin
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return false
    }

    // Admins have access to everything
    if (userProfile?.role === "admin") {
      return true
    }

    // Resource-specific authorization checks
    switch (resourceType) {
      case "stream":
        return await isAuthorizedForStream(userId, resourceId, action)
      case "dj_profile":
        return await isAuthorizedForDjProfile(userId, resourceId, action)
      case "chat_message":
        return await isAuthorizedForChatMessage(userId, resourceId, action)
      case "profile":
        return userId === resourceId // Users can only access their own profiles
      default:
        return false
    }
  } catch (error) {
    console.error(`Error checking authorization for ${resourceType}:`, error)
    return false
  }
}

/**
 * Checks if a user is authorized to access a stream
 */
async function isAuthorizedForStream(
  userId: string,
  streamId: string,
  action: "read" | "create" | "update" | "delete",
): Promise<boolean> {
  // For reading, check if stream is public or user is the DJ
  if (action === "read") {
    const { data, error } = await supabase
      .from("live_streams")
      .select("is_public, dj_profiles(user_id)")
      .eq("id", streamId)
      .single()

    if (error) {
      console.error("Error checking stream authorization:", error)
      return false
    }

    // Stream is public or user is the DJ
    return data.is_public || data.dj_profiles.user_id === userId
  }

  // For other actions, user must be the DJ
  const { data, error } = await supabase.from("live_streams").select("dj_profiles(user_id)").eq("id", streamId).single()

  if (error) {
    console.error("Error checking stream authorization:", error)
    return false
  }

  return data.dj_profiles.user_id === userId
}

/**
 * Checks if a user is authorized to access a DJ profile
 */
async function isAuthorizedForDjProfile(
  userId: string,
  djProfileId: string,
  action: "read" | "create" | "update" | "delete",
): Promise<boolean> {
  // Anyone can read DJ profiles
  if (action === "read") {
    return true
  }

  // For other actions, user must own the DJ profile
  const { data, error } = await supabase.from("dj_profiles").select("user_id").eq("id", djProfileId).single()

  if (error) {
    console.error("Error checking DJ profile authorization:", error)
    return false
  }

  return data.user_id === userId
}

/**
 * Checks if a user is authorized to access a chat message
 */
async function isAuthorizedForChatMessage(
  userId: string,
  messageId: string,
  action: "read" | "create" | "update" | "delete",
): Promise<boolean> {
  // Anyone can read chat messages
  if (action === "read") {
    return true
  }

  // For delete, user must be the message author or the stream DJ
  if (action === "delete") {
    const { data, error } = await supabase
      .from("stream_chat_messages")
      .select("user_id, stream_id")
      .eq("id", messageId)
      .single()

    if (error) {
      console.error("Error checking chat message authorization:", error)
      return false
    }

    // User is the message author
    if (data.user_id === userId) {
      return true
    }

    // Check if user is the DJ of the stream
    const { data: stream, error: streamError } = await supabase
      .from("live_streams")
      .select("dj_profiles(user_id)")
      .eq("id", data.stream_id)
      .single()

    if (streamError) {
      console.error("Error checking stream DJ:", streamError)
      return false
    }

    return stream.dj_profiles.user_id === userId
  }

  // For update, user must be the message author
  const { data, error } = await supabase.from("stream_chat_messages").select("user_id").eq("id", messageId).single()

  if (error) {
    console.error("Error checking chat message authorization:", error)
    return false
  }

  return data.user_id === userId
}
