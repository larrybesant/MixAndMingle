"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { validateData, djProfileSchema } from "@/lib/validation"
import { checkDuplicateArtistName } from "@/lib/business-logic"
import { logger, logDbOperation } from "@/lib/logging"

export async function getDjProfile(userId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  logDbOperation("select", "dj_profiles", userId, { userId })

  const { data, error } = await supabase.from("dj_profiles").select("*").eq("id", userId).single()

  if (error) {
    logger.error({
      message: "Error fetching DJ profile",
      userId,
      action: "select",
      resource: "dj_profiles",
      resourceId: userId,
      error,
    })
    return null
  }

  return data
}

export async function createOrUpdateDjProfile(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    logger.warn({
      message: "Unauthenticated user attempted to create/update DJ profile",
      action: "create/update",
      resource: "dj_profiles",
    })
    return { error: "Not authenticated" }
  }

  // Extract form data
  const artistName = formData.get("artistName") as string
  const bio = formData.get("bio") as string
  const genreString = formData.get("genres") as string
  const genres = genreString.split(",").map((g) => g.trim())
  const experienceYears = Number.parseInt(formData.get("experienceYears") as string)
  const hourlyRate = Number.parseFloat(formData.get("hourlyRate") as string)
  const portfolioLinksString = formData.get("portfolioLinks") as string
  const portfolioLinks = portfolioLinksString.split("\n").filter((link) => link.trim() !== "")

  // Validate the data
  const validation = validateData(djProfileSchema, {
    artist_name: artistName,
    bio,
    genre: genres,
    experience_years: experienceYears,
    hourly_rate: hourlyRate,
    portfolio_links: portfolioLinks,
  })

  if (!validation.success) {
    logger.warn({
      message: "DJ profile validation failed",
      userId: user.id,
      action: "validate",
      resource: "dj_profiles",
      details: { validationError: validation.error },
    })
    return { error: validation.error }
  }

  // Check if profile exists
  const { data: existingProfile } = await supabase.from("dj_profiles").select("id").eq("id", user.id).single()

  // Check for duplicate artist name
  const { isDuplicate, error: duplicateError } = await checkDuplicateArtistName(
    artistName,
    existingProfile ? user.id : undefined,
  )

  if (duplicateError) {
    logger.error({
      message: "Error checking for duplicate artist name",
      userId: user.id,
      action: "validate",
      resource: "dj_profiles",
      error: duplicateError,
    })
    return { error: "Failed to check for duplicate artist name" }
  }

  if (isDuplicate) {
    logger.warn({
      message: "Duplicate artist name detected",
      userId: user.id,
      action: "validate",
      resource: "dj_profiles",
      details: { artistName },
    })
    return { error: "Artist name already exists. Please choose a different name." }
  }

  if (existingProfile) {
    // Update existing profile
    logDbOperation("update", "dj_profiles", user.id, { id: user.id })

    const { error } = await supabase
      .from("dj_profiles")
      .update({
        artist_name: artistName,
        bio,
        genre: genres,
        experience_years: experienceYears,
        hourly_rate: hourlyRate,
        portfolio_links: portfolioLinks,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      logger.error({
        message: "Error updating DJ profile",
        userId: user.id,
        action: "update",
        resource: "dj_profiles",
        resourceId: user.id,
        error,
      })
      return { error: "Failed to update profile" }
    }
  } else {
    // Create new profile
    logDbOperation("insert", "dj_profiles", user.id, { id: user.id })

    const { error } = await supabase.from("dj_profiles").insert({
      id: user.id,
      artist_name: artistName,
      bio,
      genre: genres,
      experience_years: experienceYears,
      hourly_rate: hourlyRate,
      portfolio_links: portfolioLinks,
    })

    if (error) {
      logger.error({
        message: "Error creating DJ profile",
        userId: user.id,
        action: "insert",
        resource: "dj_profiles",
        resourceId: user.id,
        error,
      })
      return { error: "Failed to create profile" }
    }
  }

  logger.info({
    message: existingProfile ? "DJ profile updated" : "DJ profile created",
    userId: user.id,
    action: existingProfile ? "update" : "insert",
    resource: "dj_profiles",
    resourceId: user.id,
  })

  revalidatePath("/dj-profile")
  redirect("/dj-profile")
}

export async function getAllDjProfiles() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  logDbOperation("select", "dj_profiles")

  const { data, error } = await supabase
    .from("dj_profiles")
    .select(`
      *,
      profiles:id (
        first_name,
        last_name,
        avatar_url
      )
    `)
    .order("artist_name")

  if (error) {
    logger.error({
      message: "Error fetching DJ profiles",
      action: "select",
      resource: "dj_profiles",
      error,
    })
    return []
  }

  return data
}
