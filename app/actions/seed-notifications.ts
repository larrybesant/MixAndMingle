"use server"

import { supabase } from "@/lib/supabase-client"

export async function seedNotifications(userId: string) {
  try {
    // Check if user already has notifications
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    if (count && count > 0) {
      return { success: true, message: "User already has notifications" }
    }

    // Sample notifications
    const notifications = [
      {
        user_id: userId,
        title: "Welcome to Mix-and-Mingle!",
        content: "We're excited to have you join our community. Start exploring to find your matches!",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      },
      {
        user_id: userId,
        title: "Complete Your Profile",
        content: "Add more details to your profile to improve your matches.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
      {
        user_id: userId,
        title: "New Feature: Video Chat",
        content: "You can now video chat with your matches! Try it out.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      },
    ]

    // Insert notifications
    const { error } = await supabase.from("notifications").insert(notifications)

    if (error) {
      console.error("Error seeding notifications:", error)
      return { success: false, message: "Error seeding notifications" }
    }

    return { success: true, message: "Notifications seeded successfully" }
  } catch (error) {
    console.error("Error in seedNotifications:", error)
    return { success: false, message: "Error seeding notifications" }
  }
}
