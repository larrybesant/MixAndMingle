import { createClient } from "@/lib/supabase/client"

type EventType =
  | "page_view"
  | "button_click"
  | "form_submit"
  | "stream_start"
  | "stream_end"
  | "stream_join"
  | "stream_leave"
  | "event_create"
  | "event_rsvp"
  | "profile_update"
  | "dj_profile_create"
  | "song_request"
  | "chat_message"

interface TrackEventOptions {
  eventType: EventType
  properties?: Record<string, any>
  userId?: string
  sessionId?: string
}

export async function trackEvent({ eventType, properties = {}, userId, sessionId }: TrackEventOptions): Promise<void> {
  try {
    const supabase = createClient()

    // Get current user if not provided
    if (!userId) {
      const { data } = await supabase.auth.getUser()
      userId = data.user?.id || null
    }

    // Get session ID if not provided
    if (!sessionId && typeof window !== "undefined") {
      sessionId = sessionStorage.getItem("analytics_session_id") || null
    }

    // Create analytics event
    await supabase.from("analytics_events").insert({
      event_type: eventType,
      properties,
      user_id: userId,
      session_id: sessionId,
      page_path: typeof window !== "undefined" ? window.location.pathname : null,
      referrer: typeof document !== "undefined" ? document.referrer : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    // Silently fail for analytics
    console.error("Error tracking event:", error)
  }
}

// Helper functions for common events
export function trackButtonClick(buttonName: string, properties: Record<string, any> = {}): void {
  trackEvent({
    eventType: "button_click",
    properties: {
      button_name: buttonName,
      ...properties,
    },
  })
}

export function trackFormSubmit(formName: string, properties: Record<string, any> = {}): void {
  trackEvent({
    eventType: "form_submit",
    properties: {
      form_name: formName,
      ...properties,
    },
  })
}

export function trackStreamEvent(
  streamAction: "start" | "end" | "join" | "leave",
  streamId: string,
  properties: Record<string, any> = {},
): void {
  trackEvent({
    eventType: `stream_${streamAction}` as EventType,
    properties: {
      stream_id: streamId,
      ...properties,
    },
  })
}

export function trackEventRSVP(eventId: string, rsvpStatus: string, properties: Record<string, any> = {}): void {
  trackEvent({
    eventType: "event_rsvp",
    properties: {
      event_id: eventId,
      rsvp_status: rsvpStatus,
      ...properties,
    },
  })
}
