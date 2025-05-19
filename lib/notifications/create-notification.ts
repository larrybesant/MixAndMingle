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
}: CreateNotificationOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        title,
        content,
        type,
        relatedId,
        relatedType,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create notification")
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error creating notification:", error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function createEventInvitationNotification(
  userId: string,
  eventTitle: string,
  eventId: string,
  inviterName: string,
): Promise<{ success: boolean; error?: string }> {
  return createNotification({
    userId,
    title: "New Event Invitation",
    content: `${inviterName} invited you to ${eventTitle}`,
    type: "event_invitation",
    relatedId: eventId,
    relatedType: "event",
  })
}

export async function createEventReminderNotification(
  userId: string,
  eventTitle: string,
  eventId: string,
  startTime: string,
): Promise<{ success: boolean; error?: string }> {
  const eventDate = new Date(startTime)
  const formattedDate = eventDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  return createNotification({
    userId,
    title: "Event Reminder",
    content: `${eventTitle} is starting soon on ${formattedDate}`,
    type: "event_reminder",
    relatedId: eventId,
    relatedType: "event",
  })
}

export async function createNewMessageNotification(
  userId: string,
  senderName: string,
  messagePreview: string,
  chatId: string,
): Promise<{ success: boolean; error?: string }> {
  return createNotification({
    userId,
    title: "New Message",
    content: `${senderName}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? "..." : ""}`,
    type: "new_message",
    relatedId: chatId,
    relatedType: "chat",
  })
}

export async function createStreamStartingNotification(
  userId: string,
  djName: string,
  streamTitle: string,
  streamId: string,
): Promise<{ success: boolean; error?: string }> {
  return createNotification({
    userId,
    title: "Live Stream Starting",
    content: `${djName} is going live: ${streamTitle}`,
    type: "stream_starting",
    relatedId: streamId,
    relatedType: "stream",
  })
}
