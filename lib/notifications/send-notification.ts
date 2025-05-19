import { createNotification } from "@/app/actions/notifications"
import { sendEmail } from "@/lib/email/send-email"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { logger } from "@/lib/logging"

type NotificationType =
  | "event_invitation"
  | "event_reminder"
  | "new_message"
  | "stream_starting"
  | "friend_request"
  | "system"

interface SendNotificationOptions {
  userId: string
  title: string
  content: string
  type: NotificationType
  relatedId?: string
  relatedType?: string
  emailData?: Record<string, any>
}

export async function sendNotification({
  userId,
  title,
  content,
  type,
  relatedId,
  relatedType,
  emailData,
}: SendNotificationOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Create the in-app notification
    const notificationResult = await createNotification({
      userId,
      title,
      content,
      type,
      relatedId,
      relatedType,
    })

    if ("error" in notificationResult) {
      throw new Error(notificationResult.error)
    }

    // Check if the user has email notifications enabled for this type
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, first_name, last_name, email_notifications")
      .eq("id", userId)
      .single()

    if (profileError) {
      logger.error({
        message: "Error fetching user profile for email notification",
        action: "select",
        resource: "profiles",
        error: profileError,
      })
      return { success: true, error: "Failed to send email notification" }
    }

    // If the user has email notifications disabled, just return success
    if (!profile.email_notifications) {
      return { success: true }
    }

    // Only send emails for certain notification types
    if (["event_invitation", "event_reminder", "stream_starting"].includes(type) && emailData) {
      // Map notification type to email template
      const emailTemplate = type === "stream_starting" ? "stream_notification" : type

      // Send the email
      await sendEmail({
        to: profile.email,
        subject: title,
        template: emailTemplate as any,
        templateData: {
          recipientName: `${profile.first_name} ${profile.last_name}`,
          ...emailData,
        },
      })
    }

    return { success: true }
  } catch (error: any) {
    logger.error({
      message: "Error sending notification with email",
      action: "send",
      resource: "notifications",
      error: error.message,
    })

    return {
      success: false,
      error: error.message,
    }
  }
}

export async function sendEventInvitationNotification(
  userId: string,
  eventTitle: string,
  eventId: string,
  inviterName: string,
  eventDate: string,
  eventLocation: string,
  eventDescription?: string,
): Promise<{ success: boolean; error?: string }> {
  return sendNotification({
    userId,
    title: "New Event Invitation",
    content: `${inviterName} invited you to ${eventTitle}`,
    type: "event_invitation",
    relatedId: eventId,
    relatedType: "event",
    emailData: {
      inviterName,
      eventTitle,
      eventDate,
      eventLocation,
      eventDescription,
      eventId,
    },
  })
}

export async function sendEventReminderNotification(
  userId: string,
  eventTitle: string,
  eventId: string,
  eventDate: string,
  eventLocation: string,
  eventDescription?: string,
): Promise<{ success: boolean; error?: string }> {
  return sendNotification({
    userId,
    title: "Event Reminder",
    content: `Reminder: ${eventTitle} is coming up soon`,
    type: "event_reminder",
    relatedId: eventId,
    relatedType: "event",
    emailData: {
      eventTitle,
      eventDate,
      eventLocation,
      eventDescription,
      eventId,
    },
  })
}

export async function sendStreamStartingNotification(
  userId: string,
  djName: string,
  streamTitle: string,
  streamId: string,
  streamTime: string,
  streamDescription?: string,
): Promise<{ success: boolean; error?: string }> {
  return sendNotification({
    userId,
    title: "Live Stream Starting",
    content: `${djName} is going live: ${streamTitle}`,
    type: "stream_starting",
    relatedId: streamId,
    relatedType: "stream",
    emailData: {
      djName,
      streamTitle,
      streamTime,
      streamDescription,
      streamId,
    },
  })
}
