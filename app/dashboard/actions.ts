"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createEvent(formData: FormData) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, message: "You must be logged in to create an event" }
    }

    // Extract form data
    const title = formData.get("title") as string
    const location = formData.get("location") as string
    const description = formData.get("description") as string
    const startDate = formData.get("start_date") as string
    const startTime = formData.get("start_time") as string
    const endDate = (formData.get("end_date") as string) || null
    const endTime = (formData.get("end_time") as string) || null
    const capacity = formData.get("capacity") ? Number.parseInt(formData.get("capacity") as string) : null
    const imageUrl = (formData.get("image_url") as string) || null

    // Validate required fields
    if (!title || !location || !startDate || !startTime) {
      return { success: false, message: "Missing required fields" }
    }

    // Create the event
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          title,
          location,
          description,
          start_date: startDate,
          start_time: startTime,
          end_date: endDate,
          end_time: endTime,
          capacity,
          image_url: imageUrl,
          organizer_id: session.user.id,
          is_public: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error creating event:", error)
      return { success: false, message: error.message }
    }

    // Revalidate the dashboard page to show the new event
    revalidatePath("/dashboard")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating event:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function createDjProfile(formData: FormData) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, message: "You must be logged in to create a DJ profile" }
    }

    // Extract form data
    const artistName = formData.get("artist_name") as string
    const bio = formData.get("bio") as string
    const genreString = formData.get("genre") as string
    const experienceYears = formData.get("experience_years")
      ? Number.parseInt(formData.get("experience_years") as string)
      : null
    const hourlyRate = formData.get("hourly_rate") ? Number.parseFloat(formData.get("hourly_rate") as string) : null
    const portfolioLinksString = formData.get("portfolio_links") as string

    // Process genres and portfolio links
    const genre = genreString ? genreString.split(",").map((g) => g.trim()) : []
    const portfolioLinks = portfolioLinksString ? portfolioLinksString.split("\n").filter(Boolean) : []

    // Validate required fields
    if (!artistName) {
      return { success: false, message: "Artist name is required" }
    }

    // Create the DJ profile
    const { data, error } = await supabase
      .from("dj_profiles")
      .insert([
        {
          id: session.user.id,
          artist_name: artistName,
          bio,
          genre,
          experience_years: experienceYears,
          hourly_rate: hourlyRate,
          portfolio_links: portfolioLinks,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error creating DJ profile:", error)
      return { success: false, message: error.message }
    }

    // Revalidate the dashboard page to show the new DJ profile
    revalidatePath("/dashboard")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating DJ profile:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function createLiveStream(formData: FormData) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, message: "You must be logged in to create a live stream" }
    }

    // Check if user has a DJ profile
    const { data: djProfile } = await supabase.from("dj_profiles").select("id").eq("id", session.user.id).single()

    if (!djProfile) {
      return { success: false, message: "You must create a DJ profile before scheduling a live stream" }
    }

    // Extract form data
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const scheduledStartDate = formData.get("scheduled_start_date") as string
    const scheduledStartTime = formData.get("scheduled_start_time") as string
    const thumbnailUrl = (formData.get("thumbnail_url") as string) || null
    const isPublic = formData.get("is_public") === "on"

    // Validate required fields
    if (!title || !scheduledStartDate || !scheduledStartTime) {
      return { success: false, message: "Missing required fields" }
    }

    // Combine date and time into a timestamp
    const scheduledStart = new Date(`${scheduledStartDate}T${scheduledStartTime}`).toISOString()

    // Generate a random stream key
    const streamKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Create the live stream
    const { data, error } = await supabase
      .from("live_streams")
      .insert([
        {
          title,
          description,
          dj_id: session.user.id,
          scheduled_start: scheduledStart,
          thumbnail_url: thumbnailUrl,
          is_public: isPublic,
          status: "scheduled",
          stream_key: streamKey,
          viewer_count: 0,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error creating live stream:", error)
      return { success: false, message: error.message }
    }

    // Revalidate the dashboard page to show the new live stream
    revalidatePath("/dashboard")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating live stream:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}
