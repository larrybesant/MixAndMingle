import { supabase } from "@/utils/supabase-client"
import { isAuthorized } from "@/utils/auth-utils"
import { validateData, streamSchema, chatMessageSchema } from "@/utils/validation-utils"
import { isRateLimited, recordRateLimitedAction } from "@/utils/rate-limit-utils"

// Get all live streams (only public ones unless user is the DJ)
export async function getAllStreams(userId?: string) {
  try {
    let query = supabase
      .from("live_streams")
      .select(
        `
        *,
        dj_profiles(id, artist_name, user_id, profiles(id, first_name, last_name, avatar_url))
      `,
      )
      .order("scheduled_start", { ascending: true })

    // If user is not logged in, only show public streams
    if (!userId) {
      query = query.eq("is_public", true)
    } else {
      // If user is logged in, show public streams and streams where user is the DJ
      query = query.or(`is_public.eq.true,dj_profiles.user_id.eq.${userId}`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching streams:", error)
      throw new Error("Failed to fetch streams")
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllStreams:", error)
    throw error
  }
}

// Get live streams by status (only public ones unless user is the DJ)
export async function getStreamsByStatus(status: string, userId?: string) {
  try {
    // Validate status
    if (!["scheduled", "live", "ended"].includes(status)) {
      throw new Error("Invalid stream status")
    }

    let query = supabase
      .from("live_streams")
      .select(
        `
        *,
        dj_profiles(id, artist_name, user_id, profiles(id, first_name, last_name, avatar_url))
      `,
      )
      .eq("status", status)
      .order("scheduled_start", { ascending: true })

    // If user is not logged in, only show public streams
    if (!userId) {
      query = query.eq("is_public", true)
    } else {
      // If user is logged in, show public streams and streams where user is the DJ
      query = query.or(`is_public.eq.true,dj_profiles.user_id.eq.${userId}`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching streams by status:", error)
      throw new Error(`Failed to fetch ${status} streams`)
    }

    return data || []
  } catch (error) {
    console.error("Error in getStreamsByStatus:", error)
    throw error
  }
}

// Get streams by DJ ID
export async function getStreamsByDjId(djId: string, userId?: string) {
  try {
    // Validate DJ ID
    if (!djId || typeof djId !== "string") {
      throw new Error("Invalid DJ ID")
    }

    let query = supabase
      .from("live_streams")
      .select(
        `
        *,
        dj_profiles(id, artist_name, user_id, profiles(id, first_name, last_name, avatar_url))
      `,
      )
      .eq("dj_id", djId)
      .order("scheduled_start", { ascending: false })

    // If user is not the DJ, only show public streams
    if (!userId) {
      query = query.eq("is_public", true)
    } else {
      // Get the user_id for the DJ
      const { data: djData, error: djError } = await supabase
        .from("dj_profiles")
        .select("user_id")
        .eq("id", djId)
        .single()

      if (djError || !djData) {
        console.error("Error fetching DJ profile:", djError)
        throw new Error("DJ profile not found")
      }

      // If user is not the DJ, only show public streams
      if (userId !== djData.user_id) {
        query = query.eq("is_public", true)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching streams by DJ ID:", error)
      throw new Error("Failed to fetch DJ streams")
    }

    return data || []
  } catch (error) {
    console.error("Error in getStreamsByDjId:", error)
    throw error
  }
}

// Get stream by ID (with authorization check)
export async function getStreamById(streamId: string, userId?: string) {
  try {
    // Validate stream ID
    if (!streamId || typeof streamId !== "string") {
      throw new Error("Invalid stream ID")
    }

    const { data, error } = await supabase
      .from("live_streams")
      .select(
        `
        *,
        dj_profiles(id, artist_name, user_id, profiles(id, first_name, last_name, avatar_url))
      `,
      )
      .eq("id", streamId)
      .single()

    if (error) {
      console.error("Error fetching stream:", error)
      throw new Error("Stream not found")
    }

    // Check if stream is public or user is the DJ
    if (!data.is_public && userId !== data.dj_profiles.user_id) {
      throw new Error("Not authorized to view this stream")
    }

    return data
  } catch (error) {
    console.error("Error in getStreamById:", error)
    throw error
  }
}

// Create a new stream (with authorization check)
export async function createStream(
  djId: string,
  userId: string,
  streamData: {
    title: string
    description?: string
    scheduled_start: string
    thumbnail_url?: string
    is_public?: boolean
  },
) {
  try {
    // Validate user authentication
    if (!userId) {
      throw new Error("User not authenticated")
    }

    // Validate input data
    const validation = validateData(streamSchema, streamData)
    if (!validation.success) {
      throw new Error("Invalid stream data: " + JSON.stringify(validation.errors))
    }

    // Check if user is authorized to create a stream for this DJ
    const isAuth = await isAuthorized(userId, "dj_profile", djId, "update")
    if (!isAuth) {
      throw new Error("Not authorized to create stream for this DJ")
    }

    const { data, error } = await supabase
      .from("live_streams")
      .insert({
        dj_id: djId,
        ...validation.data,
        status: "scheduled",
      })
      .select()

    if (error) {
      console.error("Error creating stream:", error)
      throw new Error("Failed to create stream")
    }

    return data
  } catch (error) {
    console.error("Error in createStream:", error)
    throw error
  }
}

// Update a stream (with authorization check)
export async function updateStream(
  streamId: string,
  userId: string,
  streamData: {
    title?: string
    description?: string
    scheduled_start?: string
    thumbnail_url?: string
    is_public?: boolean
    status?: string
  },
) {
  try {
    // Validate user authentication
    if (!userId) {
      throw new Error("User not authenticated")
    }

    // Validate stream ID
    if (!streamId || typeof streamId !== "string") {
      throw new Error("Invalid stream ID")
    }

    // Create a partial schema for validation
    const partialStreamSchema = streamSchema.partial()

    // Validate input data
    const validation = validateData(partialStreamSchema, streamData)
    if (!validation.success) {
      throw new Error("Invalid stream data: " + JSON.stringify(validation.errors))
    }

    // Check if user is authorized
    const isAuth = await isAuthorized(userId, "stream", streamId, "update")
    if (!isAuth) {
      throw new Error("Not authorized to update this stream")
    }

    // Validate status if provided
    if (streamData.status && !["scheduled", "live", "ended"].includes(streamData.status)) {
      throw new Error("Invalid stream status")
    }

    const { data, error } = await supabase
      .from("live_streams")
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", streamId)
      .select()

    if (error) {
      console.error("Error updating stream:", error)
      throw new Error("Failed to update stream")
    }

    return data
  } catch (error) {
    console.error("Error in updateStream:", error)
    throw error
  }
}

// Start a stream (with authorization check)
export async function startStream(streamId: string, userId: string) {
  try {
    // Validate user authentication
    if (!userId) {
      throw new Error("User not authenticated")
    }

    // Validate stream ID
    if (!streamId || typeof streamId !== "string") {
      throw new Error("Invalid stream ID")
    }

    // Check if user is authorized
    const isAuth = await isAuthorized(userId, "stream", streamId, "update")
    if (!isAuth) {
      throw new Error("Not authorized to start this stream")
    }

    // Check if stream is in the correct state
    const { data: streamData, error: streamError } = await supabase
      .from("live_streams")
      .select("status")
      .eq("id", streamId)
      .single()

    if (streamError) {
      console.error("Error fetching stream status:", streamError)
      throw new Error("Stream not found")
    }

    if (streamData.status === "ended") {
      throw new Error("Cannot start a stream that has already ended")
    }

    if (streamData.status === "live") {
      throw new Error("Stream is already live")
    }

    const { data, error } = await supabase
      .from("live_streams")
      .update({
        status: "live",
        actual_start: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", streamId)
      .select()

    if (error) {
      console.error("Error starting stream:", error)
      throw new Error("Failed to start stream")
    }

    return data
  } catch (error) {
    console.error("Error in startStream:", error)
    throw error
  }
}

// End a stream (with authorization check)
export async function endStream(streamId: string, userId: string) {
  try {
    // Validate user authentication
    if (!userId) {
      throw new Error("User not authenticated")
    }

    // Validate stream ID
    if (!streamId || typeof streamId !== "string") {
      throw new Error("Invalid stream ID")
    }

    // Check if user is authorized
    const isAuth = await isAuthorized(userId, "stream", streamId, "update")
    if (!isAuth) {
      throw new Error("Not authorized to end this stream")
    }

    // Check if stream is in the correct state
    const { data: streamData, error: streamError } = await supabase
      .from("live_streams")
      .select("status")
      .eq("id", streamId)
      .single()

    if (streamError) {
      console.error("Error fetching stream status:", streamError)
      throw new Error("Stream not found")
    }

    if (streamData.status !== "live") {
      throw new Error("Cannot end a stream that is not live")
    }

    const { data, error } = await supabase
      .from("live_streams")
      .update({
        status: "ended",
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", streamId)
      .select()

    if (error) {
      console.error("Error ending stream:", error)
      throw new Error("Failed to end stream")
    }

    return data
  } catch (error) {
    console.error("Error in endStream:", error)
    throw error
  }
}

// Join a stream as a viewer (with rate limiting)
export async function joinStream(streamId: string, userId: string) {
  try {
    // Validate user authentication
    if (!userId) {
      throw new Error("User not authenticated")
    }

    // Validate stream ID
    if (!streamId || typeof streamId !== "string") {
      throw new Error("Invalid stream ID")
    }

    // Check rate limiting
    const isLimited = await isRateLimited(userId, "stream_join")
    if (isLimited) {
      throw new Error("Rate limit exceeded. Please try again later.")
    }

    // Record this action for rate limiting
    await recordRateLimitedAction(userId, "stream_join")

    // Check if stream exists and is live
    const { data: streamData, error: streamError } = await supabase
      .from("live_streams")
      .select("status, is_public")
      .eq("id", streamId)
      .single()

    if (streamError) {
      console.error("Error checking stream status:", streamError)
      throw new Error("Stream not found")
    }

    if (streamData.status !== "live") {
      throw new Error("Stream is not live")
    }

    // Check if user has joined this stream recently (rate limiting)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data: recentJoins, error: recentJoinsError } = await supabase
      .from("stream_viewers")
      .select("id")
      .eq("stream_id", streamId)
      .eq("user_id", userId)
      .gt("created_at", fiveMinutesAgo)

    if (recentJoinsError) {
      console.error("Error checking recent joins:", recentJoinsError)
      throw new Error("Failed to check recent joins")
    }

    if (recentJoins && recentJoins.length > 0) {
      // User has already joined recently, update that record instead of creating a new one
      const { data, error } = await supabase
        .from("stream_viewers")
        .update({
          left_at: null, // Clear left_at if they're rejoining
          updated_at: new Date().toISOString(),
        })
        .eq("id", recentJoins[0].id)
        .select()

      if (error) {
        console.error("Error updating stream viewer:", error)
        throw new Error("Failed to join stream")
      }

      // Update viewer count
      await supabase.rpc("increment_stream_viewers", { stream_id: streamId })

      return data
    }

    // Create new viewer record
    const { data, error } = await supabase
      .from("stream_viewers")
      .insert({
        stream_id: streamId,
        user_id: userId,
      })
      .select()

    if (error) {
      console.error("Error joining stream:", error)
      throw new Error("Failed to join stream")
    }

    // Update viewer count
    await supabase.rpc("increment_stream_viewers", { stream_id: streamId })

    return data
  } catch (error) {
    console.error("Error in joinStream:", error)
    throw error
  }
}

// Leave a stream as a viewer
export async function leaveStream(streamId: string, userId: string) {
  try {
    // Validate user authentication
    if (!userId) {
      throw new Error("User not authenticated")
    }

    // Validate stream ID
    if (!streamId || typeof streamId !== "string") {
      throw new Error("Invalid stream ID")
    }

    const { data, error } = await supabase
      .from("stream_viewers")
      .update({
        left_at: new Date().toISOString(),
      })
      .eq("stream_id", streamId)
      .eq("user_id", userId)
      .is("left_at", null)
      .select()

    if (error) {
      console.error("Error leaving stream:", error)
      throw new Error("Failed to leave stream")
    }

    // Update viewer count
    await supabase.rpc("decrement_stream_viewers", { stream_id: streamId })

    return data
  } catch (error) {
    console.error("Error in leaveStream:", error)
    throw error
  }
}

// Get stream viewers
export async function getStreamViewers(streamId: string) {
  try {
    // Validate stream ID
    if (!streamId || typeof streamId !== "string") {
      throw new Error("Invalid stream ID")
    }

    const { data, error } = await supabase
      .from("stream_viewers")
      .select(
        `
        *,
        profiles(id, first_name, last_name, avatar_url, username)
      `,
      )
      .eq("stream_id", streamId)
      .is("left_at", null)

    if (error) {
      console.error("Error fetching stream viewers:", error)
      throw new Error("Failed to fetch viewers")
    }

    return data || []
  } catch (error) {
    console.error("Error in getStreamViewers:", error)
    throw error
  }
}

// Get stream chat messages (with pagination)
export async function getStreamChatMessages(streamId: string, limit = 100, page = 0) {
  try {
    // Validate stream ID
    if (!streamId || typeof streamId !== "string") {
      throw new Error("Invalid stream ID")
    }

    // Validate pagination parameters
    if (limit < 1 || limit > 500) {
      limit = 100 // Default to 100 if invalid
    }

    if (page < 0) {
      page = 0 // Default to first page if invalid
    }

    const { data, error } = await supabase
      .from("stream_chat_messages")
      .select(
        `
        *,
        profiles(id, first_name, last_name, avatar_url, username)
      `,
      )
      .eq("stream_id", streamId)
      .order("created_at", { ascending: true })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      console.error("Error fetching stream chat messages:", error)
      throw new Error("Failed to fetch chat messages")
    }

    return data || []
  } catch (error) {
    console.error("Error in getStreamChatMessages:", error)
    throw error
  }
}

// Send a stream chat message (with rate limiting)
export async function sendStreamChatMessage(streamId: string, userId: string, content: string) {
  try {
    // Validate user authentication
    if (!userId) {
      throw new Error("User not authenticated")
    }

    // Validate stream ID
    if (!streamId || typeof streamId !== "string") {
      throw new Error("Invalid stream ID")
    }

    // Check rate limiting
    const isLimited = await isRateLimited(userId, "chat_message")
    if (isLimited) {
      throw new Error("You're sending messages too quickly. Please wait a moment.")
    }

    // Record this action for rate limiting
    await recordRateLimitedAction(userId, "chat_message")

    // Validate message content
    const validation = validateData(chatMessageSchema, { content })
    if (!validation.success) {
      throw new Error("Invalid message: " + JSON.stringify(validation.errors))
    }

    // Check if stream exists and is live
    const { data: streamData, error: streamError } = await supabase
      .from("live_streams")
      .select("status")
      .eq("id", streamId)
      .single()

    if (streamError) {
      console.error("Error checking stream status:", streamError)
      throw new Error("Stream not found")
    }

    if (streamData.status !== "live") {
      throw new Error("Cannot send messages to a stream that is not live")
    }

    const { data, error } = await supabase
      .from("stream_chat_messages")
      .insert({
        stream_id: streamId,
        user_id: userId,
        content: validation.data.content,
      })
      .select()

    if (error) {
      console.error("Error sending stream chat message:", error)
      throw new Error("Failed to send message")
    }

    return data
  } catch (error) {
    console.error("Error in sendStreamChatMessage:", error)
    throw error
  }
}

// Subscribe to stream chat messages
export async function subscribeToStreamChat(streamId: string, callback: (message: any) => void) {
  try {
    // Validate stream ID
    if (!streamId || typeof streamId !== "string") {
      throw new Error("Invalid stream ID")
    }

    const subscription = supabase
      .channel(`stream-chat:${streamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "stream_chat_messages",
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          callback(payload.new)
        },
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          console.error("Failed to subscribe to chat:", status)
        }
      })

    return () => {
      supabase.removeChannel(subscription)
    }
  } catch (error) {
    console.error("Error in subscribeToStreamChat:", error)
    throw error
  }
}

// Delete a chat message (for moderation)
export async function deleteChatMessage(messageId: string, userId: string) {
  try {
    // Validate user authentication
    if (!userId) {
      throw new Error("User not authenticated")
    }

    // Validate message ID
    if (!messageId || typeof messageId !== "string") {
      throw new Error("Invalid message ID")
    }

    // Check if user is authorized
    const isAuth = await isAuthorized(userId, "chat_message", messageId, "delete")
    if (!isAuth) {
      throw new Error("Not authorized to delete this message")
    }

    // Soft delete the message
    const { data, error } = await supabase
      .from("stream_chat_messages")
      .update({
        is_deleted: true,
        content: "[Message deleted]",
      })
      .eq("id", messageId)
      .select()

    if (error) {
      console.error("Error deleting message:", error)
      throw new Error("Failed to delete message")
    }

    return data
  } catch (error) {
    console.error("Error in deleteChatMessage:", error)
    throw error
  }
}

// Get viewer count for a stream
export async function getStreamViewerCount(streamId: string): Promise<number> {
  if (!streamId) return 0

  try {
    const { data, error } = await supabase.from("live_streams").select("viewer_count").eq("id", streamId).single()

    if (error) {
      console.error("Error fetching stream viewer count:", error)
      return 0
    }

    return data?.viewer_count || 0
  } catch (error) {
    console.error("Error in getStreamViewerCount:", error)
    return 0
  }
}

// Get featured streams
export async function getFeaturedStreams(limit = 5): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("live_streams")
      .select(`
        *,
        dj_profiles(id, artist_name, user_id, profiles(id, first_name, last_name, avatar_url))
      `)
      .eq("status", "live")
      .eq("is_public", true)
      .order("viewer_count", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching featured streams:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getFeaturedStreams:", error)
    return []
  }
}

// Get upcoming streams
export async function getUpcomingStreams(limit = 10): Promise<any[]> {
  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("live_streams")
      .select(`
        *,
        dj_profiles(id, artist_name, user_id, profiles(id, first_name, last_name, avatar_url))
      `)
      .eq("status", "scheduled")
      .eq("is_public", true)
      .gt("scheduled_start", now)
      .order("scheduled_start", { ascending: true })
      .limit(limit)

    if (error) {
      console.error("Error fetching upcoming streams:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getUpcomingStreams:", error)
    return []
  }
}

// Check if user is streaming
export async function isUserStreaming(userId: string): Promise<boolean> {
  if (!userId) return false

  try {
    // Get user's DJ profile
    const { data: djProfile, error: djError } = await supabase
      .from("dj_profiles")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (djError || !djProfile) {
      return false
    }

    // Check if DJ has an active stream
    const { data, error } = await supabase
      .from("live_streams")
      .select("id")
      .eq("dj_id", djProfile.id)
      .eq("status", "live")
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking if user is streaming:", error)
    }

    return !!data
  } catch (error) {
    console.error("Error in isUserStreaming:", error)
    return false
  }
}
