"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { validateData, chatMessageSchema, directMessageSchema } from "@/lib/validation"
import { moderateContent } from "@/lib/business-logic"
import { logger, logDbOperation } from "@/lib/logging"

export async function sendChatMessage(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    logger.warn({
      message: "Unauthenticated user attempted to send chat message",
      action: "create",
      resource: "chat_messages",
    })
    return { error: "Not authenticated" }
  }

  // Extract form data
  const content = formData.get("content") as string
  const roomId = formData.get("roomId") as string

  // Validate the data
  const validation = validateData(chatMessageSchema, {
    content,
    room_id: roomId,
  })

  if (!validation.success) {
    logger.warn({
      message: "Chat message validation failed",
      userId: user.id,
      action: "validate",
      resource: "chat_messages",
      details: { validationError: validation.error },
    })
    return { error: validation.error }
  }

  // Moderate content
  const { isAppropriate, filteredContent } = moderateContent(content)

  if (!isAppropriate) {
    logger.warn({
      message: "Inappropriate content detected in chat message",
      userId: user.id,
      action: "moderate",
      resource: "chat_messages",
      details: { roomId },
    })
    // We'll still send the message, but with filtered content
  }

  // Send the message
  logDbOperation("insert", "chat_messages", user.id, { roomId })

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      content: isAppropriate ? content : filteredContent,
      room_id: roomId,
      sender_id: user.id,
    })
    .select()
    .single()

  if (error) {
    logger.error({
      message: "Error sending chat message",
      userId: user.id,
      action: "insert",
      resource: "chat_messages",
      error,
    })
    return { error: "Failed to send message" }
  }

  logger.info({
    message: "Chat message sent",
    userId: user.id,
    action: "insert",
    resource: "chat_messages",
    resourceId: data.id,
    details: { roomId },
  })

  revalidatePath(`/chat/${roomId}`)
  return { success: true, messageId: data.id, wasModerated: !isAppropriate }
}

export async function getChatMessages(roomId: string, limit = 50) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  logDbOperation("select", "chat_messages", undefined, { roomId, limit })

  const { data, error } = await supabase
    .from("chat_messages")
    .select(`
      *,
      sender:sender_id (
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    logger.error({
      message: "Error fetching chat messages",
      action: "select",
      resource: "chat_messages",
      error,
    })
    return []
  }

  return data.reverse() // Return in chronological order
}

export async function sendDirectMessage(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    logger.warn({
      message: "Unauthenticated user attempted to send direct message",
      action: "create",
      resource: "direct_messages",
    })
    return { error: "Not authenticated" }
  }

  // Extract form data
  const content = formData.get("content") as string
  const recipientId = formData.get("recipientId") as string
  const attachmentUrl = formData.get("attachmentUrl") as string
  const attachmentType = formData.get("attachmentType") as string
  const isVoiceMessage = formData.get("isVoiceMessage") === "true"

  // Validate the data
  const validation = validateData(directMessageSchema, {
    content,
    recipient_id: recipientId,
    attachment_url: attachmentUrl,
    attachment_type: attachmentType,
    is_voice_message: isVoiceMessage,
  })

  if (!validation.success) {
    logger.warn({
      message: "Direct message validation failed",
      userId: user.id,
      action: "validate",
      resource: "direct_messages",
      details: { validationError: validation.error },
    })
    return { error: validation.error }
  }

  // Moderate content if it's not a voice message
  let finalContent = content
  let wasModerated = false

  if (!isVoiceMessage) {
    const { isAppropriate, filteredContent } = moderateContent(content)
    if (!isAppropriate) {
      finalContent = filteredContent
      wasModerated = true
      logger.warn({
        message: "Inappropriate content detected in direct message",
        userId: user.id,
        action: "moderate",
        resource: "direct_messages",
        details: { recipientId },
      })
    }
  }

  // Send the message
  logDbOperation("insert", "direct_messages", user.id, { recipientId })

  const { data, error } = await supabase
    .from("direct_messages")
    .insert({
      content: finalContent,
      recipient_id: recipientId,
      sender_id: user.id,
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
      is_voice_message: isVoiceMessage,
      is_read: false,
    })
    .select()
    .single()

  if (error) {
    logger.error({
      message: "Error sending direct message",
      userId: user.id,
      action: "insert",
      resource: "direct_messages",
      error,
    })
    return { error: "Failed to send message" }
  }

  logger.info({
    message: "Direct message sent",
    userId: user.id,
    action: "insert",
    resource: "direct_messages",
    resourceId: data.id,
    details: { recipientId, isVoiceMessage },
  })

  revalidatePath(`/messages/${recipientId}`)
  return { success: true, messageId: data.id, wasModerated }
}

export async function getDirectMessages(otherUserId: string, limit = 50) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  logDbOperation("select", "direct_messages", user.id, { otherUserId, limit })

  // Get messages between the two users
  const { data, error } = await supabase
    .from("direct_messages")
    .select(`
      *,
      sender:sender_id (
        first_name,
        last_name,
        avatar_url
      ),
      recipient:recipient_id (
        first_name,
        last_name,
        avatar_url
      )
    `)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .or(`sender_id.eq.${otherUserId},recipient_id.eq.${otherUserId}`)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    logger.error({
      message: "Error fetching direct messages",
      userId: user.id,
      action: "select",
      resource: "direct_messages",
      error,
    })
    return []
  }

  // Mark messages as read
  const unreadMessages = data.filter((msg) => msg.recipient_id === user.id && !msg.is_read).map((msg) => msg.id)

  if (unreadMessages.length > 0) {
    await supabase.from("direct_messages").update({ is_read: true }).in("id", unreadMessages)
  }

  return data.reverse() // Return in chronological order
}
