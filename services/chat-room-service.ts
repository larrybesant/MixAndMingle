import { supabase } from "@/lib/supabase-client"

// Get all chat rooms
export async function getAllChatRooms() {
  const { data, error } = await supabase
    .from("chat_rooms")
    .select(
      `
      *,
      profiles(id, first_name, last_name, avatar_url)
    `,
    )
    .order("name")

  if (error) {
    console.error("Error fetching chat rooms:", error)
    return []
  }

  return data || []
}

// Get chat room by ID
export async function getChatRoomById(roomId: string) {
  const { data, error } = await supabase
    .from("chat_rooms")
    .select(
      `
      *,
      profiles(id, first_name, last_name, avatar_url)
    `,
    )
    .eq("id", roomId)
    .single()

  if (error) {
    console.error("Error fetching chat room:", error)
    return null
  }

  return data
}

// Create a new chat room
export async function createChatRoom(
  userId: string,
  room: {
    name: string
    description?: string
    image_url?: string
    is_private?: boolean
  },
) {
  const { data, error } = await supabase
    .from("chat_rooms")
    .insert({
      created_by: userId,
      ...room,
    })
    .select()

  if (error) {
    console.error("Error creating chat room:", error)
    return null
  }

  // Add creator as admin
  await supabase.from("chat_room_members").insert({
    room_id: data[0].id,
    user_id: userId,
    role: "admin",
  })

  return data
}

// Update a chat room
export async function updateChatRoom(
  roomId: string,
  room: {
    name?: string
    description?: string
    image_url?: string
    is_private?: boolean
  },
) {
  const { data, error } = await supabase
    .from("chat_rooms")
    .update({
      ...room,
      updated_at: new Date().toISOString(),
    })
    .eq("id", roomId)
    .select()

  if (error) {
    console.error("Error updating chat room:", error)
    return null
  }

  return data
}

// Get chat room members
export async function getChatRoomMembers(roomId: string) {
  const { data, error } = await supabase
    .from("chat_room_members")
    .select(
      `
      *,
      profiles(id, first_name, last_name, avatar_url)
    `,
    )
    .eq("room_id", roomId)
    .order("created_at")

  if (error) {
    console.error("Error fetching chat room members:", error)
    return []
  }

  return data || []
}

// Join a chat room
export async function joinChatRoom(roomId: string, userId: string) {
  const { data, error } = await supabase
    .from("chat_room_members")
    .insert({
      room_id: roomId,
      user_id: userId,
    })
    .select()

  if (error) {
    console.error("Error joining chat room:", error)
    return null
  }

  return data
}

// Leave a chat room
export async function leaveChatRoom(roomId: string, userId: string) {
  const { data, error } = await supabase
    .from("chat_room_members")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .select()

  if (error) {
    console.error("Error leaving chat room:", error)
    return null
  }

  return data
}

// Get chat room messages
export async function getChatRoomMessages(roomId: string) {
  const { data, error } = await supabase
    .from("chat_room_messages")
    .select(
      `
      *,
      profiles(id, first_name, last_name, avatar_url)
    `,
    )
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching chat room messages:", error)
    return []
  }

  return data || []
}

// Send a chat room message
export async function sendChatRoomMessage(roomId: string, userId: string, content: string) {
  const { data, error } = await supabase
    .from("chat_room_messages")
    .insert({
      room_id: roomId,
      user_id: userId,
      content,
    })
    .select()

  if (error) {
    console.error("Error sending chat room message:", error)
    return null
  }

  return data
}

// Subscribe to chat room messages
export async function subscribeToChatRoom(roomId: string, callback: (message: any) => void) {
  const subscription = supabase
    .channel(`chat-room:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_room_messages",
        filter: `room_id=eq.${roomId}`,
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
