"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { validateData, eventSchema } from "@/lib/validation"
import { checkDuplicateEventTitle, checkSchedulingConflicts } from "@/lib/business-logic"
import { logger, logDbOperation } from "@/lib/logging"
import { createNotification, notifyEventAttendees } from "./notifications"

export async function createEvent(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    logger.warn({
      message: "Unauthenticated user attempted to create event",
      action: "create",
      resource: "events",
    })
    return { error: "Not authenticated" }
  }

  // Extract form data
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const location = formData.get("location") as string
  const startTime = formData.get("startTime") as string
  const endTime = formData.get("endTime") as string
  const capacity = Number.parseInt(formData.get("capacity") as string, 10) || 0
  const djId = (formData.get("djId") as string) || null

  // Validate the data
  const validation = validateData(eventSchema, {
    title,
    description,
    location,
    start_time: startTime,
    end_time: endTime,
  })

  if (!validation.success) {
    logger.warn({
      message: "Event validation failed",
      userId: user.id,
      action: "validate",
      resource: "events",
      details: { validationError: validation.error },
    })
    return { error: validation.error }
  }

  // Check for duplicate event title on the same day
  const eventDate = new Date(startTime).toISOString().split("T")[0]
  const { isDuplicate, error: duplicateError } = await checkDuplicateEventTitle(title, eventDate)

  if (duplicateError) {
    logger.error({
      message: "Error checking for duplicate event title",
      userId: user.id,
      action: "validate",
      resource: "events",
      error: duplicateError,
    })
    return { error: "Failed to check for duplicate event title" }
  }

  if (isDuplicate) {
    logger.warn({
      message: "Duplicate event title detected",
      userId: user.id,
      action: "validate",
      resource: "events",
      details: { title, eventDate },
    })
    return { error: "An event with this title already exists on the same day. Please choose a different title." }
  }

  // Check for scheduling conflicts
  const { hasConflicts, conflicts, error: conflictError } = await checkSchedulingConflicts(user.id, startTime, endTime)

  if (conflictError) {
    logger.error({
      message: "Error checking for scheduling conflicts",
      userId: user.id,
      action: "validate",
      resource: "events",
      error: conflictError,
    })
    return { error: "Failed to check for scheduling conflicts" }
  }

  if (hasConflicts) {
    logger.warn({
      message: "Scheduling conflict detected",
      userId: user.id,
      action: "validate",
      resource: "events",
      details: { conflicts },
    })
    return {
      error: "You have scheduling conflicts with other events during this time.",
      conflicts,
    }
  }

  // Create the event
  logDbOperation("insert", "events", user.id, { title })

  const { data, error } = await supabase
    .from("events")
    .insert({
      title,
      description,
      location,
      start_time: startTime,
      end_time: endTime,
      creator_id: user.id,
      capacity,
      dj_id: djId,
    })
    .select()
    .single()

  if (error) {
    logger.error({
      message: "Error creating event",
      userId: user.id,
      action: "insert",
      resource: "events",
      error,
    })
    return { error: "Failed to create event" }
  }

  logger.info({
    message: "Event created",
    userId: user.id,
    action: "insert",
    resource: "events",
    resourceId: data.id,
    details: { title },
  })

  // Send notification to the creator
  await createNotification({
    userId: user.id,
    title: "Event Created",
    content: `You've successfully created the event "${title}"`,
    type: "system",
    relatedId: data.id,
    relatedType: "event",
  })

  // Automatically RSVP the creator
  const { error: rsvpError } = await supabase.from("event_rsvps").insert({
    event_id: data.id,
    user_id: user.id,
    status: "attending",
  })

  if (rsvpError) {
    logger.error({
      message: "Error creating RSVP for event creator",
      userId: user.id,
      action: "insert",
      resource: "event_rsvps",
      error: rsvpError,
    })
    // Don't return error here, as the event was created successfully
  }

  revalidatePath("/events")
  return { success: true, eventId: data.id }
}

export async function updateEvent(eventId: string, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if user is the creator of the event
  const { data: event } = await supabase.from("events").select("creator_id").eq("id", eventId).single()

  if (!event || event.creator_id !== user.id) {
    logger.warn({
      message: "Unauthorized attempt to update event",
      userId: user.id,
      action: "update",
      resource: "events",
      resourceId: eventId,
    })
    return { error: "Not authorized to update this event" }
  }

  // Extract form data
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const location = formData.get("location") as string
  const startTime = formData.get("startTime") as string
  const endTime = formData.get("endTime") as string
  const capacity = Number.parseInt(formData.get("capacity") as string, 10) || 0
  const djId = (formData.get("djId") as string) || null

  // Validate the data
  const validation = validateData(eventSchema, {
    title,
    description,
    location,
    start_time: startTime,
    end_time: endTime,
  })

  if (!validation.success) {
    logger.warn({
      message: "Event validation failed",
      userId: user.id,
      action: "validate",
      resource: "events",
      resourceId: eventId,
      details: { validationError: validation.error },
    })
    return { error: validation.error }
  }

  // Check for duplicate event title on the same day
  const eventDate = new Date(startTime).toISOString().split("T")[0]
  const { isDuplicate, error: duplicateError } = await checkDuplicateEventTitle(title, eventDate, eventId)

  if (duplicateError) {
    logger.error({
      message: "Error checking for duplicate event title",
      userId: user.id,
      action: "validate",
      resource: "events",
      resourceId: eventId,
      error: duplicateError,
    })
    return { error: "Failed to check for duplicate event title" }
  }

  if (isDuplicate) {
    logger.warn({
      message: "Duplicate event title detected",
      userId: user.id,
      action: "validate",
      resource: "events",
      resourceId: eventId,
      details: { title, eventDate },
    })
    return { error: "An event with this title already exists on the same day. Please choose a different title." }
  }

  // Update the event
  logDbOperation("update", "events", user.id, { id: eventId, title })

  const { error } = await supabase
    .from("events")
    .update({
      title,
      description,
      location,
      start_time: startTime,
      end_time: endTime,
      capacity,
      dj_id: djId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)

  if (error) {
    logger.error({
      message: "Error updating event",
      userId: user.id,
      action: "update",
      resource: "events",
      resourceId: eventId,
      error,
    })
    return { error: "Failed to update event" }
  }

  logger.info({
    message: "Event updated",
    userId: user.id,
    action: "update",
    resource: "events",
    resourceId: eventId,
    details: { title },
  })

  // Notify attendees about the update
  await notifyEventAttendees(eventId, "Event Updated", `The event "${title}" has been updated`, "event_reminder")

  revalidatePath("/events")
  revalidatePath(`/events/${eventId}`)
  return { success: true }
}

export async function getEvent(eventId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  logDbOperation("select", "events", undefined, { id: eventId })

  const { data, error } = await supabase
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

  if (error) {
    logger.error({
      message: "Error fetching event",
      action: "select",
      resource: "events",
      resourceId: eventId,
      error,
    })
    return null
  }

  return data
}

export async function getEvents(filter?: "upcoming" | "past" | "all") {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  logDbOperation("select", "events", undefined, { filter })

  let query = supabase.from("events").select(`
      *,
      creator:creator_id (
        first_name,
        last_name,
        avatar_url
      ),
      dj:dj_id (
        artist_name
      )
    `)

  if (filter === "upcoming") {
    query = query.gte("start_time", new Date().toISOString())
  } else if (filter === "past") {
    query = query.lt("end_time", new Date().toISOString())
  }

  const { data, error } = await query.order("start_time", { ascending: true })

  if (error) {
    logger.error({
      message: "Error fetching events",
      action: "select",
      resource: "events",
      error,
    })
    return []
  }

  return data
}

export async function rsvpToEvent(eventId: string, status: "attending" | "maybe" | "declined") {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    logger.warn({
      message: "Unauthenticated user attempted to RSVP",
      action: "create",
      resource: "event_rsvps",
    })
    return { error: "Not authenticated" }
  }

  // Check if event exists and has capacity
  const { data: event } = await supabase.from("events").select("capacity").eq("id", eventId).single()

  if (!event) {
    logger.warn({
      message: "RSVP attempted for non-existent event",
      userId: user.id,
      action: "validate",
      resource: "event_rsvps",
      details: { eventId },
    })
    return { error: "Event not found" }
  }

  // Check if user already has an RSVP
  const { data: existingRsvp } = await supabase
    .from("event_rsvps")
    .select("id, status")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single()

  // If attending, check capacity
  if (status === "attending" && event.capacity > 0) {
    // Only check capacity if user isn't already attending
    if (!existingRsvp || existingRsvp.status !== "attending") {
      const { count } = await supabase
        .from("event_rsvps")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("status", "attending")

      if (count >= event.capacity) {
        logger.warn({
          message: "RSVP attempted for event at capacity",
          userId: user.id,
          action: "validate",
          resource: "event_rsvps",
          details: { eventId, capacity: event.capacity, currentCount: count },
        })
        return { error: "This event has reached capacity" }
      }
    }
  }

  logDbOperation(existingRsvp ? "update" : "insert", "event_rsvps", user.id, {
    eventId,
    status,
    existingStatus: existingRsvp?.status,
  })

  if (existingRsvp) {
    // Update existing RSVP
    const { error } = await supabase
      .from("event_rsvps")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", existingRsvp.id)

    if (error) {
      logger.error({
        message: "Error updating RSVP",
        userId: user.id,
        action: "update",
        resource: "event_rsvps",
        resourceId: existingRsvp.id,
        error,
      })
      return { error: "Failed to update RSVP" }
    }
  } else {
    // Create new RSVP
    const { error } = await supabase.from("event_rsvps").insert({
      event_id: eventId,
      user_id: user.id,
      status,
    })

    if (error) {
      logger.error({
        message: "Error creating RSVP",
        userId: user.id,
        action: "insert",
        resource: "event_rsvps",
        error,
      })
      return { error: "Failed to create RSVP" }
    }
  }

  logger.info({
    message: existingRsvp ? "RSVP updated" : "RSVP created",
    userId: user.id,
    action: existingRsvp ? "update" : "insert",
    resource: "event_rsvps",
    details: { eventId, status },
  })

  revalidatePath(`/events/${eventId}`)
  return { success: true }
}
