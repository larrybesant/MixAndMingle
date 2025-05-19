import { supabase } from "@/lib/supabase-client"
import type { MatchChatRoom, MatchChatMessage } from "@/types/database"
import { createNotification } from "./notification-service"
import { getProfileById } from "./profile-service"

export async function getChatRoomByMatchId(matchId: string): Promise<MatchChatRoom | null> {
  // Check if a chat room already exists for this match
  const { data: existingRoom, error: roomError } = await supabase
    .from("match_chat_rooms")
    .select("*")
    .eq("match_id", matchId)
    .single()

  if (roomError && roomError.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    console.error("Error fetching chat room:", roomError)
    return null
  }

  if (existingRoom) {
    return existingRoom
  }

  // Create a new chat room if one doesn't exist
  const { data: newRoom, error: createError } = await supabase
    .from("match_chat_rooms")
    .insert({
      match_id: matchId,
    })
    .select()
    .single()

  if (createError) {
    console.error("Error creating chat room:", createError)
    return null
  }

  return newRoom
}

export async function getChatMessages(roomId: string): Promise<MatchChatMessage[]> {
  const { data, error } = await supabase
    .from("match_chat_messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching chat messages:", error)
    return []
  }

  return data || []
}

export async function sendChatMessage(
  roomId: string,
  senderId: string,
  content: string,
  attachmentUrl?: string,
  attachmentType?: string,
): Promise<MatchChatMessage | null> {
  // Send the message
  const { data: message, error: messageError } = await supabase
    .from("match_chat_messages")
    .insert({
      room_id: roomId,
      sender_id: senderId,
      content,
      attachment_url: attachmentUrl || null,
      attachment_type: attachmentType || null,
    })
    .select()
    .single()

  if (messageError) {
    console.error("Error sending message:", messageError)
    return null
  }

  // Update the last_message_at timestamp in the chat room
  const { error: updateError } = await supabase
    .from("match_chat_rooms")
    .update({
      last_message_at: new Date().toISOString(),
    })
    .eq("id", roomId)

  if (updateError) {
    console.error("Error updating chat room timestamp:", updateError)
  }

  // Get the chat room to find the match
  const { data: chatRoom } = await supabase.from("match_chat_rooms").select("match_id").eq("id", roomId).single()

  if (chatRoom) {
    // Get the match to find the recipient
    const { data: match } = await supabase
      .from("matches")
      .select("user1_id, user2_id")
      .eq("id", chatRoom.match_id)
      .single()

    if (match) {
      // Determine the recipient
      const recipientId = match.user1_id === senderId ? match.user2_id : match.user1_id

      // Get sender profile
      const senderProfile = await getProfileById(senderId)

      if (senderProfile) {
        // Create notification for the recipient
        await createNotification(
          recipientId,
          "New Message",
          `${senderProfile.first_name} ${senderProfile.last_name} sent you a message.`,
          chatRoom.match_id,
        )
      }
    }
  }

  return message
}

export async function markMessagesAsRead(roomId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("match_chat_messages")
    .update({
      is_read: true,
    })
    .eq("room_id", roomId)
    .neq("sender_id", userId)
    .eq("is_read", false)

  if (error) {
    console.error("Error marking messages as read:", error)
    return false
  }

  return true
}

export async function subscribeToMessages(
  roomId: string,
  callback: (message: MatchChatMessage) => void,
): Promise<() => void> {
  const subscription = supabase
    .channel(`room:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "match_chat_messages",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        callback(payload.new as MatchChatMessage)
      },
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription)
  }
}
