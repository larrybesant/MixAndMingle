"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { logger } from "@/lib/logging"

type NotificationType =
  | "event_invitation"
  | "event_reminder"
  | "new_message"
  | "stream_starting"
  | "friend_request"
  | "system"

interface CreateNotificationOptions {
  userId: string
  title: string
  content: string
  type: NotificationType
  relatedId?: string
  relatedType?: string
}

export async function createNotification({
  userId,
  title,
  content,
  type,
  relatedId,
  relatedType,
}: CreateNotificationOptions) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    logger.warn({
      message: "Unauthenticated user attempted to create notification",
      action: "create",
      resource: "notifications",
    })
    return { error: "Not authenticated" }
  }

  // Check if the user has permission to send notifications to this user
  // For now, only allow sending to self or if the user is an admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
  const isAdmin = profile?.is_admin === true

  if (userId !== user.id && !isAdmin) {
    logger.warn({
      message: "Unauthorized attempt to create notification for another user",
      userId: user.id,
      action: "create",
      resource: "notifications",
      details: { targetUserId: userId },
    })
    return { error: "Not authorized to create notifications for other users" }
  }

  // Create the notification
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title,
      content,
      type,
      related_id: relatedId,
      related_type: relatedType,
      is_read: false,
    })
    .select()

  if (error) {
    logger.error({
      message: "Error creating notification",
      userId: user.id,
      action: "insert",
      resource: "notifications",
      error,
    })
    return { error: "Failed to create notification" }
  }

  logger.info({
    message: "Notification created",
    userId: user.id,
    action: "insert",
    resource: "notifications",
    resourceId: data[0].id,
  })

  return { success: true, notificationId: data[0].id }
}

export async function notifyEventAttendees(eventId: string, title: string, content: string, type: NotificationType) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get all users who are attending the event
  const { data: attendees, error: attendeesError } = await supabase
    .from("event_rsvps")
    .select("user_id")
    .eq("event_id", eventId)
    .eq("status", "attending")

  if (attendeesError) {
    logger.error({
      message: "Error fetching event attendees",
      userId: user.id,
      action: "select",
      resource: "event_rsvps",
      error: attendeesError,
    })
    return { error: "Failed to fetch event attendees" }
  }

  // Create notifications for each attendee
  const results = await Promise.all(
    attendees.map(async (attendee) => {
      if (attendee.user_id === user.id) return null // Skip the current user

      return createNotification({
        userId: attendee.user_id,
        title,
        content,
        type,
        relatedId: eventId,
        relatedType: "event",
      })
    }),
  )

  const errors = results.filter(Boolean).filter((result) => result && "error" in result) as { error: string }[]
  if (errors.length > 0) {
    logger.warn({
      message: "Some notifications failed to send",
      userId: user.id,
      action: "batch",
      resource: "notifications",
      details: { errors: errors.map((e) => e.error) },
    })
    return { warning: "Some notifications failed to send", errors: errors.map((e) => e.error) }
  }

  return { success: true, count: attendees.length - 1 } // Subtract 1 for the current user
}

export async function markAllNotificationsAsRead() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Mark all notifications as read
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (error) {
    logger.error({
      message: "Error marking notifications as read",
      userId: user.id,
      action: "update",
      resource: "notifications",
      error,
    })
    return { error: "Failed to mark notifications as read" }
  }

  return { success: true }
}

export async function getUnreadNotificationsCount() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { count: 0 }
  }

  // Get count of unread notifications
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (error) {
    logger.error({
      message: "Error counting unread notifications",
      userId: user.id,
      action: "select",
      resource: "notifications",
      error,
    })
    return { count: 0 }
  }

  return { count: count || 0 }
}
