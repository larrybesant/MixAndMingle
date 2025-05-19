import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { withErrorHandling } from "@/app/api/error-handler"
import { validateData, eventSchema } from "@/lib/validation"
import { logger, logApiRequest } from "@/lib/logging"

export const GET = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const eventId = params.id
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  logApiRequest(request)

  // Get event details
  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      creator:creator_id (
        first_name,
        last_name,
        avatar_url
      ),
      dj:dj_id (
        artist_name,
        genre,
        hourly_rate
      )
    `)
    .eq("id", eventId)
    .single()

  if (error || !event) {
    logger.error({
      message: "Error fetching event",
      action: "GET",
      resource: `/api/events/${eventId}`,
      error,
    })
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  // Get RSVPs for this event
  const { data: rsvps, error: rsvpError } = await supabase
    .from("event_rsvps")
    .select(`
      status,
      user:user_id (
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq("event_id", eventId)

  if (rsvpError) {
    logger.error({
      message: "Error fetching event RSVPs",
      action: "GET",
      resource: `/api/events/${eventId}`,
      error: rsvpError,
    })
    // Continue anyway, just without RSVPs
  }

  // Group RSVPs by status
  const groupedRsvps = {
    attending: [],
    maybe: [],
    declined: [],
  }

  if (rsvps) {
    rsvps.forEach((rsvp) => {
      if (rsvp.status in groupedRsvps) {
        groupedRsvps[rsvp.status].push(rsvp.user)
      }
    })
  }

  return NextResponse.json({
    event,
    rsvps: groupedRsvps,
    attendeeCount: groupedRsvps.attending.length,
  })
})

export const PUT = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const eventId = params.id
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  logApiRequest(request)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Check if user is the creator of the event
  const { data: event } = await supabase.from("events").select("creator_id").eq("id", eventId).single()

  if (!event || event.creator_id !== user.id) {
    logger.warn({
      message: "Unauthorized attempt to update event",
      userId: user.id,
      action: "PUT",
      resource: `/api/events/${eventId}`,
    })
    return NextResponse.json({ error: "Not authorized to update this event" }, { status: 403 })
  }

  // Get the request body
  const body = await request.json()

  // Validate the data
  const validation = validateData(eventSchema, {
    title: body.title,
    description: body.description,
    location: body.location,
    start_time: body.start_time,
    end_time: body.end_time,
  })

  if (!validation.success) {
    logger.warn({
      message: "Event validation failed",
      userId: user.id,
      action: "PUT",
      resource: `/api/events/${eventId}`,
      details: { validationError: validation.error },
    })
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  // Update the event
  const { error } = await supabase
    .from("events")
    .update({
      title: body.title,
      description: body.description,
      location: body.location,
      start_time: body.start_time,
      end_time: body.end_time,
      capacity: body.capacity,
      dj_id: body.dj_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)

  if (error) {
    logger.error({
      message: "Error updating event",
      userId: user.id,
      action: "PUT",
      resource: `/api/events/${eventId}`,
      error,
    })
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }

  logger.info({
    message: "Event updated via API",
    userId: user.id,
    action: "PUT",
    resource: `/api/events/${eventId}`,
    resourceId: eventId,
  })

  return NextResponse.json({ success: true })
})

export const DELETE = withErrorHandling(async (request: Request, { params }: { params: { id: string } }) => {
  const eventId = params.id
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  logApiRequest(request)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Check if user is the creator of the event
  const { data: event } = await supabase.from("events").select("creator_id").eq("id", eventId).single()

  if (!event || event.creator_id !== user.id) {
    logger.warn({
      message: "Unauthorized attempt to delete event",
      userId: user.id,
      action: "DELETE",
      resource: `/api/events/${eventId}`,
    })
    return NextResponse.json({ error: "Not authorized to delete this event" }, { status: 403 })
  }

  // Delete the event
  const { error } = await supabase.from("events").delete().eq("id", eventId)

  if (error) {
    logger.error({
      message: "Error deleting event",
      userId: user.id,
      action: "DELETE",
      resource: `/api/events/${eventId}`,
      error,
    })
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }

  logger.info({
    message: "Event deleted",
    userId: user.id,
    action: "DELETE",
    resource: `/api/events/${eventId}`,
    resourceId: eventId,
  })

  return NextResponse.json({ success: true })
})
