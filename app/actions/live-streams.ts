"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import crypto from "crypto"
import { createNotification } from "../actions/notifications"

// Generate a unique stream key
function generateStreamKey() {
  return crypto.randomBytes(16).toString("hex")
}

export async function createLiveStream(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if user is a DJ
  const { data: djProfile } = await supabase.from("dj_profiles").select("id").eq("id", user.id).single()

  if (!djProfile) {
    return { error: "You must create a DJ profile first" }
  }

  // Extract form data
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const eventId = (formData.get("eventId") as string) || null
  const isPublic = formData.get("isPublic") === "true"
  const scheduledStartStr = formData.get("scheduledStart") as string
  const scheduledStart = scheduledStartStr ? new Date(scheduledStartStr).toISOString() : null
  const thumbnailUrl = (formData.get("thumbnailUrl") as string) || null

  // Generate a unique stream key
  const streamKey = generateStreamKey()

  // Create the stream
  const { data, error } = await supabase
    .from("live_streams")
    .insert({
      title,
      description,
      dj_id: user.id,
      event_id: eventId,
      is_public: isPublic,
      scheduled_start: scheduledStart,
      stream_key: streamKey,
      thumbnail_url: thumbnailUrl,
      status: "scheduled",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating live stream:", error)
    return { error: "Failed to create live stream" }
  }

  // Send notification to the DJ
  await createNotification({
    userId: user.id,
    title: "Stream Scheduled",
    content: `You've scheduled a new stream: "${title}"`,
    type: "system",
    relatedId: data.id,
    relatedType: "stream",
  })

  revalidatePath("/dj/streams")
  return { success: true, streamId: data.id, streamKey }
}

export async function updateStreamStatus(streamId: string, status: "scheduled" | "live" | "ended" | "cancelled") {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if user owns this stream
  const { data: stream } = await supabase.from("live_streams").select("dj_id").eq("id", streamId).single()

  if (!stream || stream.dj_id !== user.id) {
    return { error: "Not authorized to update this stream" }
  }

  const updates: any = { status }

  // If going live, set actual start time
  if (status === "live") {
    updates.actual_start = new Date().toISOString()
  }

  // If ending, set ended_at time
  if (status === "ended") {
    updates.ended_at = new Date().toISOString()
  }

  const { error } = await supabase.from("live_streams").update(updates).eq("id", streamId)

  if (error) {
    console.error("Error updating stream status:", error)
    return { error: "Failed to update stream status" }
  }

  // If going live, notify followers
  if (status === "live") {
    // Get DJ name
    const { data: djProfile } = await supabase.from("dj_profiles").select("artist_name").eq("id", user.id).single()

    const djName = djProfile?.artist_name || "A DJ"

    // Get followers
    const { data: followers } = await supabase.from("dj_followers").select("user_id").eq("dj_id", user.id)

    if (followers && followers.length > 0) {
      // Send notifications to followers
      for (const follower of followers) {
        await createNotification({
          userId: follower.user_id,
          title: "Live Stream Starting",
          content: `${djName} is going live`,
          type: "stream_starting",
          relatedId: streamId,
          relatedType: "stream",
        })
      }
    }
  }

  revalidatePath("/dj/streams")
  revalidatePath("/streams")
  return { success: true }
}

export async function getLiveStreams(includeScheduled = true) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  let query = supabase.from("live_streams").select(`
      *,
      dj:dj_id (
        artist_name,
        profiles:id (
          username,
          full_name,
          avatar_url
        )
      ),
      event:event_id (
        title,
        location
      )
    `)

  if (includeScheduled) {
    query = query.in("status", ["scheduled", "live"])
  } else {
    query = query.eq("status", "live")
  }

  const { data, error } = await query.order("scheduled_start", { ascending: true })

  if (error) {
    console.error("Error fetching live streams:", error)
    return []
  }

  return data
}

export async function getStreamDetails(streamId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase
    .from("live_streams")
    .select(`
      *,
      dj:dj_id (
        artist_name,
        bio,
        genre,
        profiles:id (
          username,
          full_name,
          avatar_url
        )
      ),
      event:event_id (
        title,
        description,
        location,
        start_time,
        end_time
      )
    `)
    .eq("id", streamId)
    .single()

  if (error) {
    console.error("Error fetching stream details:", error)
    return null
  }

  return data
}

export async function joinStream(streamId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if already joined
  const { data: existingViewer } = await supabase
    .from("stream_viewers")
    .select("id")
    .eq("stream_id", streamId)
    .eq("user_id", user.id)
    .is("left_at", null)
    .single()

  if (existingViewer) {
    // Already joined, no need to do anything
    return { success: true }
  }

  // Join the stream
  const { error } = await supabase.from("stream_viewers").insert({
    stream_id: streamId,
    user_id: user.id,
  })

  if (error) {
    console.error("Error joining stream:", error)
    return { error: "Failed to join stream" }
  }

  // Update viewer count
  await supabase.rpc("increment_viewer_count", { stream_id: streamId })

  return { success: true }
}

export async function leaveStream(streamId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Update the viewer record
  const { error } = await supabase
    .from("stream_viewers")
    .update({ left_at: new Date().toISOString() })
    .eq("stream_id", streamId)
    .eq("user_id", user.id)
    .is("left_at", null)

  if (error) {
    console.error("Error leaving stream:", error)
    return { error: "Failed to leave stream" }
  }

  // Update viewer count
  await supabase.rpc("decrement_viewer_count", { stream_id: streamId })

  return { success: true }
}

export async function sendStreamMessage(streamId: string, content: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Send the message
  const { error } = await supabase.from("stream_chat_messages").insert({
    stream_id: streamId,
    user_id: user.id,
    content,
  })

  if (error) {
    console.error("Error sending stream message:", error)
    return { error: "Failed to send message" }
  }

  return { success: true }
}

export async function getStreamMessages(streamId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase
    .from("stream_chat_messages")
    .select(`
      *,
      profile:user_id (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("stream_id", streamId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching stream messages:", error)
    return []
  }

  return data
}

export async function requestSong(streamId: string, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const songTitle = formData.get("songTitle") as string
  const artist = formData.get("artist") as string
  const message = formData.get("message") as string

  // Create the request
  const { error } = await supabase.from("song_requests").insert({
    stream_id: streamId,
    user_id: user.id,
    song_title: songTitle,
    artist,
    message,
  })

  if (error) {
    console.error("Error requesting song:", error)
    return { error: "Failed to request song" }
  }

  return { success: true }
}

export async function getSongRequests(streamId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase
    .from("song_requests")
    .select(`
      *,
      profile:user_id (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("stream_id", streamId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching song requests:", error)
    return []
  }

  return data
}

export async function updateSongRequestStatus(
  requestId: string,
  status: "pending" | "approved" | "played" | "rejected",
) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if user is the DJ for this stream
  const { data: request } = await supabase
    .from("song_requests")
    .select(`
      stream_id,
      stream:stream_id (
        dj_id
      )
    `)
    .eq("id", requestId)
    .single()

  if (!request || request.stream.dj_id !== user.id) {
    return { error: "Not authorized to update this request" }
  }

  // Update the request
  const { error } = await supabase
    .from("song_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", requestId)

  if (error) {
    console.error("Error updating song request:", error)
    return { error: "Failed to update song request" }
  }

  return { success: true }
}
