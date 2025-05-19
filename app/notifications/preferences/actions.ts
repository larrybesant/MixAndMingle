"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { logger } from "@/lib/logging"

interface UpdateNotificationPreferencesParams {
  emailNotifications: boolean
  pushNotifications: boolean
}

export async function updateNotificationPreferences({
  emailNotifications,
  pushNotifications,
}: UpdateNotificationPreferencesParams) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Update the user's profile with the new preferences
  const { error } = await supabase
    .from("profiles")
    .update({
      email_notifications: emailNotifications,
      push_notifications: pushNotifications,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    logger.error({
      message: "Error updating notification preferences",
      userId: user.id,
      action: "update",
      resource: "profiles",
      error,
    })
    return { error: "Failed to update notification preferences" }
  }

  logger.info({
    message: "Notification preferences updated",
    userId: user.id,
    action: "update",
    resource: "profiles",
    details: { emailNotifications, pushNotifications },
  })

  return { success: true }
}
