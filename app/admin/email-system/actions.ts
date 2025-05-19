"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { sendEmail } from "@/lib/email/send-email"

export async function sendTestEmail(email: string, template: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Check if the user is an admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    return { success: false, error: "Not authorized" }
  }

  try {
    // Generate test data based on template
    let subject = ""
    let data = {}

    switch (template) {
      case "event-invitation":
        subject = "You're invited to an event!"
        data = {
          eventName: "Test Event",
          eventDate: new Date().toLocaleDateString(),
          eventLocation: "Test Location",
          eventDescription: "This is a test event invitation email.",
          inviterName: "Test User",
          actionUrl: "https://example.com/events/test",
        }
        break
      case "stream-notification":
        subject = "A DJ you follow is going live!"
        data = {
          djName: "Test DJ",
          streamTitle: "Test Stream",
          streamTime: new Date().toLocaleString(),
          streamDescription: "This is a test stream notification email.",
          actionUrl: "https://example.com/streams/test",
        }
        break
      case "event-reminder":
        subject = "Reminder: Event happening soon!"
        data = {
          eventName: "Test Event",
          eventDate: new Date().toLocaleDateString(),
          eventTime: new Date().toLocaleTimeString(),
          eventLocation: "Test Location",
          actionUrl: "https://example.com/events/test",
        }
        break
      case "welcome":
        subject = "Welcome to Social Event Planning!"
        data = {
          userName: "Test User",
          actionUrl: "https://example.com/dashboard",
        }
        break
      default:
        subject = "Test Email"
        data = {
          message: "This is a test email.",
        }
    }

    // Send the email
    const result = await sendEmail({
      to: email,
      subject,
      template,
      data,
      userId: user.id,
    })

    return { success: true, result }
  } catch (error) {
    console.error("Error sending test email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
