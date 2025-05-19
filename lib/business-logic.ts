import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// Check if a DJ is available for a given time slot
export async function checkDjAvailability(djId: string, startTime: string, endTime: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Check for overlapping events where this DJ is assigned
  const { data: overlappingEvents, error: eventsError } = await supabase
    .from("events")
    .select("id, title, start_time, end_time")
    .eq("dj_id", djId)
    .or(`start_time.lte.${endTime},end_time.gte.${startTime}`)

  if (eventsError) {
    console.error("Error checking DJ event availability:", eventsError)
    return { available: false, error: "Failed to check event availability" }
  }

  // Check for overlapping streams
  const { data: overlappingStreams, error: streamsError } = await supabase
    .from("live_streams")
    .select("id, title, scheduled_start")
    .eq("dj_id", djId)
    .lte("scheduled_start", endTime)
    .gte("scheduled_start", startTime)

  if (streamsError) {
    console.error("Error checking DJ stream availability:", streamsError)
    return { available: false, error: "Failed to check stream availability" }
  }

  const isAvailable = overlappingEvents.length === 0 && overlappingStreams.length === 0

  return {
    available: isAvailable,
    conflicts: {
      events: overlappingEvents,
      streams: overlappingStreams,
    },
  }
}

// Check if an event has reached capacity
export async function checkEventCapacity(eventId: string, capacity: number) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Count RSVPs for this event
  const { count, error } = await supabase
    .from("event_rsvps")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)

  if (error) {
    console.error("Error checking event capacity:", error)
    return { hasCapacity: false, error: "Failed to check event capacity" }
  }

  return {
    hasCapacity: count < capacity,
    currentCount: count,
    remainingCapacity: capacity - count,
  }
}

// Check for scheduling conflicts
export async function checkSchedulingConflicts(userId: string, startTime: string, endTime: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Check for events the user is attending
  const { data: attendingEvents, error: attendingError } = await supabase
    .from("event_rsvps")
    .select("event:event_id(id, title, start_time, end_time)")
    .eq("user_id", userId)
    .filter("event.start_time", "lte", endTime)
    .filter("event.end_time", "gte", startTime)

  if (attendingError) {
    console.error("Error checking attending events:", attendingError)
    return { hasConflicts: true, error: "Failed to check attending events" }
  }

  // Check for events the user is hosting
  const { data: hostingEvents, error: hostingError } = await supabase
    .from("events")
    .select("id, title, start_time, end_time")
    .eq("creator_id", userId)
    .or(`start_time.lte.${endTime},end_time.gte.${startTime}`)

  if (hostingError) {
    console.error("Error checking hosting events:", hostingError)
    return { hasConflicts: true, error: "Failed to check hosting events" }
  }

  const hasConflicts = attendingEvents.length > 0 || hostingEvents.length > 0

  return {
    hasConflicts,
    conflicts: {
      attending: attendingEvents,
      hosting: hostingEvents,
    },
  }
}

// Simple content moderation
export function moderateContent(content: string): { isAppropriate: boolean; filteredContent: string } {
  // List of inappropriate words to filter
  const inappropriateWords = [
    "badword1",
    "badword2",
    "badword3",
    // Add more inappropriate words as needed
  ]

  let filteredContent = content
  let isAppropriate = true

  // Check for and replace inappropriate words
  inappropriateWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    if (regex.test(content)) {
      isAppropriate = false
      filteredContent = filteredContent.replace(regex, "***")
    }
  })

  return { isAppropriate, filteredContent }
}

// Check for duplicate artist names
export async function checkDuplicateArtistName(artistName: string, excludeId?: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  let query = supabase.from("dj_profiles").select("id, artist_name").ilike("artist_name", artistName)

  if (excludeId) {
    query = query.neq("id", excludeId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error checking duplicate artist name:", error)
    return { isDuplicate: true, error: "Failed to check for duplicates" }
  }

  return {
    isDuplicate: data.length > 0,
    existingProfiles: data,
  }
}

// Check for duplicate event titles on the same day
export async function checkDuplicateEventTitle(title: string, date: string, excludeId?: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get the start and end of the day
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  let query = supabase
    .from("events")
    .select("id, title")
    .ilike("title", title)
    .gte("start_time", startOfDay.toISOString())
    .lte("start_time", endOfDay.toISOString())

  if (excludeId) {
    query = query.neq("id", excludeId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error checking duplicate event title:", error)
    return { isDuplicate: true, error: "Failed to check for duplicates" }
  }

  return {
    isDuplicate: data.length > 0,
    existingEvents: data,
  }
}
