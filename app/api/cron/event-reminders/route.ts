import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { logger } from "@/lib/logging"
import { sendEventReminderNotification } from "@/lib/notifications/send-notification"

// Create a Supabase client with service role for cron job
const supabase = createClient<Database>(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

export async function GET(request: NextRequest) {
  try {
    // Verify the request is authorized with a secret key
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get events starting in the next 24 hours
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setHours(now.getHours() + 24)

    const { data: upcomingEvents, error: eventsError } = await supabase
      .from("events")
      .select("id, title, start_time, location, description")
      .gte("start_time", now.toISOString())
      .lt("start_time", tomorrow.toISOString())

    if (eventsError) {
      logger.error({
        message: "Error fetching upcoming events for reminders",
        action: "select",
        resource: "events",
        error: eventsError,
      })
      return NextResponse.json({ error: "Failed to fetch upcoming events" }, { status: 500 })
    }

    // For each event, get attendees and send reminders
    let sentCount = 0
    let errorCount = 0

    for (const event of upcomingEvents) {
      // Get attendees for this event
      const { data: attendees, error: attendeesError } = await supabase
        .from("event_rsvps")
        .select("user_id")
        .eq("event_id", event.id)
        .eq("status", "attending")

      if (attendeesError) {
        logger.error({
          message: "Error fetching attendees for event reminder",
          action: "select",
          resource: "event_rsvps",
          error: attendeesError,
          details: { eventId: event.id },
        })
        errorCount++
        continue
      }

      // Format the event date
      const eventDate = new Date(event.start_time).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })

      // Send reminder to each attendee
      for (const attendee of attendees) {
        try {
          await sendEventReminderNotification(
            attendee.user_id,
            event.title,
            event.id,
            eventDate,
            event.location,
            event.description,
          )
          sentCount++
        } catch (error) {
          logger.error({
            message: "Error sending event reminder notification",
            action: "send",
            resource: "notifications",
            error,
            details: { eventId: event.id, userId: attendee.user_id },
          })
          errorCount++
        }
      }
    }

    logger.info({
      message: "Event reminder cron job completed",
      action: "cron",
      resource: "event_reminders",
      details: { sentCount, errorCount, eventsProcessed: upcomingEvents.length },
    })

    return NextResponse.json({
      success: true,
      eventsProcessed: upcomingEvents.length,
      remindersSent: sentCount,
      errors: errorCount,
    })
  } catch (error: any) {
    logger.error({
      message: "Error in event reminder cron job",
      action: "cron",
      resource: "event_reminders",
      error: error.message,
    })

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
