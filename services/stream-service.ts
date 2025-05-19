import { supabase } from "@/lib/supabase-client"

// Helper function to check if user is authorized for a stream
async function isAuthorizedForStream(streamId: string, userId: string) {
  // Check if user is the DJ of the stream
  const { data, error } = await supabase.from("live_streams").select("dj_profiles(user_id)").eq("id", streamId).single()

  if (error) {
    console.error("Error checking stream authorization:", error)
    return false
  }

  // User is authorized if they are the DJ
  if (data?.dj_profiles?.user_id === userId) {
    return true
  }

  // For public streams, all users are authorized
  const { data: streamData, error: streamError } = await supabase
    .from("live_streams")
    .select("is_public")
    .eq("id", streamId)
    .single()

  if (streamError) {
    console.error("Error checking stream visibility:", streamError)
    return false
  }

  return streamData.is_public
}

// Get all live streams (only public ones unless user is the DJ)
export async function getAllStreams(userId?: string) {
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
    return []
  }

  return data || []
}

// Get live streams by status (only public ones unless user is the DJ)
export async function getStreamsByStatus(status: string, userId?: string) {
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
    return []
  }

  return data || []
}

// Get streams by DJ ID
export async function getStreamsByDjId(djId: string, userId?: string) {
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
      return []
    }

    // If user is not the DJ, only show public streams
    if (userId !== djData.user_id) {
      query = query.eq("is_public", true)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching streams by DJ ID:", error)
    return []
  }

  return data || []
}

// Get stream by ID (with authorization check)
export async function getStreamById(streamId: string, userId?: string) {
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
    return null
  }

  // Check if stream is public or user is the DJ
  if (!data.is_public && userId !== data.dj_profiles.user_id) {
    console.error("User not authorized to view this stream")
    return null
  }

  return data
}

// Create a new stream (with authorization check)
export async function createStream(
  djId: string,
  userId: string,
  stream: {
    title: string
    description?: string
    scheduled_start: string
    thumbnail_url?: string
    is_public?: boolean
  },
) {
  // Check if user is the DJ
  const { data: djData, error: djError } = await supabase.from("dj_profiles").select("user_id").eq("id", djId).single()

  if (djError || !djData) {
    console.error("Error fetching DJ profile:", djError)
    throw new Error("DJ profile not found")
  }

  if (userId !== djData.user_id) {
    console.error("User not authorized to create stream for this DJ")
    throw new Error("Not authorized")
  }

  const { data, error } = await supabase
    .from("live_streams")
    .insert({
      dj_id: djId,
      ...stream,
      status: "scheduled",
    })
    .select()

  if (error) {
    console.error("Error creating stream:", error)
    throw new Error("Failed to create stream")
  }

  return data
}

// Update a stream (with authorization check)
export async function updateStream(
  streamId: string,
  userId: string,
  stream: {
    title?: string
    description?: string
    scheduled_start?: string
    thumbnail_url?: string
    is_public?: boolean
    status?: string
  },
) {
  // Check if user is authorized
  const isAuthorized = await isAuthorizedForStream(streamId, userId)
  if (!isAuthorized) {
    console.error("User not authorized to update this stream")
    throw new Error("Not authorized")
  }

  const { data, error } = await supabase
    .from("live_streams")
    .update({
      ...stream,
      updated_at: new Date().toISOString(),
    })
    .eq("id", streamId)
    .select()

  if (error) {
    console.error("Error updating stream:", error)
    throw new Error("Failed to update stream")
  }

  return data
}

// Start a stream (with authorization check)
export async function startStream(streamId: string, userId: string) {
  // Check if user is authorized
  const isAuthorized = await isAuthorizedForStream(streamId, userId)
  if (!isAuthorized) {
    console.error("User not authorized to start this stream")
    throw new Error("Not authorized")
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
}

// End a stream (with authorization check)
export async function endStream(streamId: string, userId: string) {
  // Check if user is authorized
  const isAuthorized = await isAuthorizedForStream(streamId, userId)
  if (!isAuthorized) {
    console.error("User not authorized to end this stream")
    throw new Error("Not authorized")
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
}

// Join a stream as a viewer (with rate limiting)
export async function joinStream(streamId: string, userId: string) {
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
  } else if (recentJoins && recentJoins.length > 0) {
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
}

// Leave a stream as a viewer
export async function leaveStream(streamId: string, userId: string) {
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
}

// Get stream viewers
export async function getStreamViewers(streamId: string) {
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
}

// Get stream chat messages (with pagination)
export async function getStreamChatMessages(streamId: string, limit = 100, page = 0) {
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
}

// Send a stream chat message (with rate limiting)
export async function sendStreamChatMessage(streamId: string, userId: string, content: string) {
  // Rate limiting: Check if user has sent too many messages recently
  const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString()

  const { count, error: countError } = await supabase
    .from("stream_chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gt("created_at", thirtySecondsAgo)

  if (countError) {
    console.error("Error checking message rate:", countError)
  } else if (count && count > 10) {
    // More than 10 messages in 30 seconds
    throw new Error("You're sending messages too quickly. Please wait a moment.")
  }

  // Sanitize content (basic check)
  if (!content || content.length > 500) {
    throw new Error("Message must be between 1 and 500 characters")
  }

  const { data, error } = await supabase
    .from("stream_chat_messages")
    .insert({
      stream_id: streamId,
      user_id: userId,
      content,
    })
    .select()

  if (error) {
    console.error("Error sending stream chat message:", error)
    throw new Error("Failed to send message")
  }

  return data
}

// Subscribe to stream chat messages
export async function subscribeToStreamChat(streamId: string, callback: (message: any) => void) {
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
    .subscribe()

  return () => {
    supabase.removeChannel(subscription)
  }
}
