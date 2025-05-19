"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

export async function createEvent(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Extract form data
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const location = formData.get("location") as string
  const startDate = formData.get("startDate") as string
  const startTime = formData.get("startTime") as string
  const endDate = (formData.get("endDate") as string) || startDate
  const endTime = formData.get("endTime") as string
  const capacity = Number.parseInt(formData.get("capacity") as string) || null
  const imageUrl = formData.get("imageUrl") as string
  const organizerId = formData.get("organizerId") as string

  // Validate required fields
  if (!title || !location || !startDate || !startTime) {
    return { error: "Missing required fields" }
  }

  // Create the event
  const { data, error } = await supabase
    .from("events")
    .insert({
      title,
      description,
      location,
      start_date: startDate,
      start_time: startTime,
      end_date: endDate || null,
      end_time: endTime || null,
      capacity,
      image_url: imageUrl || null,
      is_public: true,
      organizer_id: organizerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating event:", error)
    return { error: "Failed to create event" }
  }

  revalidatePath("/beta-test")
  return { success: true, eventId: data.id }
}

export async function createDjProfile(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Extract form data
  const artistName = formData.get("artistName") as string
  const bio = formData.get("bio") as string
  const genresString = formData.get("genres") as string
  const genres = genresString ? genresString.split(",").map((g) => g.trim()) : []
  const experienceYears = Number.parseInt(formData.get("experienceYears") as string) || 0
  const hourlyRate = Number.parseFloat(formData.get("hourlyRate") as string) || 0
  const portfolioLinksString = formData.get("portfolioLinks") as string
  const portfolioLinks = portfolioLinksString
    ? portfolioLinksString.split("\n").filter((link) => link.trim() !== "")
    : []

  // Validate required fields
  if (!artistName) {
    return { error: "Artist name is required" }
  }

  // Create the DJ profile
  const { data, error } = await supabase
    .from("dj_profiles")
    .insert({
      id: user.id,
      artist_name: artistName,
      bio,
      genre: genres,
      experience_years: experienceYears,
      hourly_rate: hourlyRate,
      portfolio_links: portfolioLinks,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating DJ profile:", error)
    return { error: "Failed to create DJ profile" }
  }

  revalidatePath("/beta-test")
  return { success: true, profileId: data.id }
}

export async function createLiveStream(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if user is a DJ
  const { data: djProfile } = await supabase.from("dj_profiles").select("id").eq("id", user.id).single()

  if (!djProfile) {
    return { error: "You must create a DJ profile first" }
  }

  // Extract form data
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const scheduledStart = formData.get("scheduledStart") as string
  const thumbnailUrl = formData.get("thumbnailUrl") as string
  const isPublic = formData.get("isPublic") === "true"
  const djId = formData.get("djId") as string

  // Validate required fields
  if (!title || !scheduledStart) {
    return { error: "Missing required fields" }
  }

  // Generate a unique stream key
  const streamKey = crypto.randomBytes(16).toString("hex")

  // Create the stream
  const { data, error } = await supabase
    .from("live_streams")
    .insert({
      title,
      description,
      dj_id: djId,
      is_public: isPublic,
      scheduled_start: scheduledStart,
      thumbnail_url: thumbnailUrl || null,
      stream_key: streamKey,
      status: "scheduled",
      viewer_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating live stream:", error)
    return { error: "Failed to create live stream" }
  }

  revalidatePath("/beta-test")
  return { success: true, streamId: data.id, streamKey }
}
