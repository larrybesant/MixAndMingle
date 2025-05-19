"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createDJProfile(formData: FormData) {
  const userId = formData.get("userId") as string
  const bio = formData.get("bio") as string
  const experience = formData.get("experience") as string
  const genresInput = formData.get("genres") as string

  if (!userId) {
    return {
      error: "User ID is required",
    }
  }

  const genres = genresInput.split(",").map((genre) => genre.trim())

  const supabase = createServerClient()

  // Check if the user already has a DJ profile
  const { data: existingProfile, error: checkError } = await supabase
    .from("dj_profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (checkError && checkError.code !== "PGRST116") {
    return {
      error: checkError.message,
    }
  }

  if (existingProfile) {
    // Update existing profile
    const { error } = await supabase
      .from("dj_profiles")
      .update({
        bio,
        experience,
        genres,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingProfile.id)

    if (error) {
      return {
        error: error.message,
      }
    }
  } else {
    // Create new profile
    const { error } = await supabase.from("dj_profiles").insert([
      {
        user_id: userId,
        bio,
        experience,
        genres,
      },
    ])

    if (error) {
      return {
        error: error.message,
      }
    }
  }

  revalidatePath("/profile")

  return {
    success: true,
  }
}

export async function startDJSession(formData: FormData) {
  const userId = formData.get("userId") as string
  const roomId = formData.get("roomId") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string

  if (!userId || !roomId || !title) {
    return {
      error: "User ID, room ID, and title are required",
    }
  }

  const supabase = createServerClient()

  // Create a new DJ session
  const { data, error } = await supabase
    .from("dj_sessions")
    .insert([
      {
        dj_id: userId,
        room_id: roomId,
        title,
        description,
        is_active: true,
      },
    ])
    .select()
    .single()

  if (error) {
    return {
      error: error.message,
    }
  }

  revalidatePath(`/rooms/${roomId}`)

  return {
    success: true,
    session: data,
  }
}

export async function endDJSession(formData: FormData) {
  const sessionId = formData.get("sessionId") as string

  if (!sessionId) {
    return {
      error: "Session ID is required",
    }
  }

  const supabase = createServerClient()

  // End the DJ session
  const { data, error } = await supabase
    .from("dj_sessions")
    .update({
      is_active: false,
      ended_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single()

  if (error) {
    return {
      error: error.message,
    }
  }

  revalidatePath(`/rooms/${data.room_id}`)

  return {
    success: true,
    session: data,
  }
}
