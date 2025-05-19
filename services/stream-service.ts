import { supabase } from "@/lib/supabase-client"

// Get all live streams
export async function getAllStreams() {
  const { data, error } = await supabase
    .from("live_streams")
    .select(
      `
      *,
      dj_profiles(id, artist_name, user_id, profiles(id, first_name, last_name, avatar_url))
    `,
    )
    .order("scheduled_start", { ascending: true })

  if (error) {
    console.error("Error fetching streams:", error)
    return []
  }

  return data || []
}

// Get live streams by status
export async function getStreamsByStatus(status: string) {
  const { data, error } = await supabase
    .from("live_streams")
    .select(
      `
      *,
      dj_profiles(id, artist_name, user_id, profiles(id, first_name, last_name, avatar_url))
    `,
    )
    .eq("status", status)
    .order("scheduled_start", { ascending: true })

  if (error) {
    console.error("Error fetching streams by status:", error)
    return []
  }

  return data || []
}

// Get stream by ID
export async function getStreamById(streamId: string) {
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

  return data
}

// Create a new stream
export async function createStream(
  djId: string,
  stream: {
    title: string
    description?: string
    scheduled_start: string
    thumbnail_url?: string
    is_public?: boolean
  },
) {
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
    return null
  }

  return data
}

// Update a stream
export async function updateStream(
  streamId: string,
  stream: {
    title?: string
    description?: string
    scheduled_start?: string
    thumbnail_url?: string
    is_public?: boolean
    status?: string
  },
) {
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
    return null
  }

  return data
}

// Start a stream
export async function startStream(streamId: string) {
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
    return null
  }

  return data
}

// End a stream
export async function endStream(streamId: string) {
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
    return null
  }

  return data
}

// Join a stream as a viewer
export async function joinStream(streamId: string, userId: string) {
  const { data, error } = await supabase
    .from("stream_viewers")
    .insert({
      stream_id: streamId,
      user_id: userId,
    })
    .select()

  if (error) {
    console.error("Error joining stream:", error)
    return null
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
    return null
  }

  // Update viewer count
  await supabase.rpc("decrement_stream_viewers", { stream_id: streamId })

  return data
}

// Get stream chat messages
export async function getStreamChatMessages(streamId: string) {
  const { data, error } = await supabase
    .from("stream_chat_messages")
    .select(
      `
      *,
      profiles(id, first_name, last_name, avatar_url)
    `,
    )
    .eq("stream_id", streamId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching stream chat messages:", error)
    return []
  }

  return data || []
}

// Send a stream chat message
export async function sendStreamChatMessage(streamId: string, userId: string, content: string) {
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
    return null
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

// Get stream viewers
export async function getStreamViewers(streamId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from("stream_viewers")
    .select(`user_id, profiles(id, first_name, last_name, avatar_url)`)
    .eq("stream_id", streamId)
    .is("left_at", null)

  if (error) {
    console.error("Error fetching stream viewers:", error)
    return []
  }

  return data || []
}
