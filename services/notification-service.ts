import { supabase } from "@/lib/supabase-client"

// Get unread notification count
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    if (!userId) {
      return 0
    }

    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false)

    if (error) {
      console.error("Error fetching unread notification count:", error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error("Error in getUnreadNotificationCount:", error)
    return 0
  }
}

// Export the function with the name expected by other parts of the app
export const getUnreadNotificationsCount = getUnreadNotificationCount

export async function createNotification(userId: string, title: string, content: string, matchId?: string) {
  try {
    if (!userId) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type: title, // Using title as type for now
        content: content,
        match_id: matchId || null,
      })
      .select()

    if (error) {
      console.error("Error creating notification:", error)
      throw new Error("Failed to create notification")
    }

    return data
  } catch (error) {
    console.error("Error in createNotification:", error)
    throw error
  }
}

export async function getUserNotifications(userId: string, limit = 20, page = 0) {
  try {
    if (!userId) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      console.error("Error fetching notifications:", error)
      throw new Error("Failed to fetch notifications")
    }

    return data || []
  } catch (error) {
    console.error("Error in getUserNotifications:", error)
    throw error
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    if (!userId) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", userId) // Ensure user owns the notification
      .select()

    if (error) {
      console.error("Error marking notification as read:", error)
      throw new Error("Failed to update notification")
    }

    return data
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error)
    throw error
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    if (!userId) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)
      .select()

    if (error) {
      console.error("Error marking all notifications as read:", error)
      throw new Error("Failed to update notifications")
    }

    return data
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead:", error)
    throw error
  }
}

export async function deleteNotification(notificationId: string, userId: string) {
  try {
    if (!userId) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", userId) // Ensure user owns the notification
      .select()

    if (error) {
      console.error("Error deleting notification:", error)
      throw new Error("Failed to delete notification")
    }

    return data
  } catch (error) {
    console.error("Error in deleteNotification:", error)
    throw error
  }
}

export function subscribeToNotifications(userId: string, callback: (notification: any) => void) {
  try {
    if (!userId) {
      throw new Error("User not authenticated")
    }

    const subscription = supabase
      .channel(`user-notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new)
        },
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          console.error("Failed to subscribe to notifications:", status)
        }
      })

    return () => {
      supabase.removeChannel(subscription)
    }
  } catch (error) {
    console.error("Error in subscribeToNotifications:", error)
    throw error
  }
}
