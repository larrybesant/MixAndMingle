"use server"

import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with admin privileges
const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function createUserWithProfile(email: string, password: string, firstName: string, lastName: string) {
  try {
    // Create the user
    const { data: userData, error: userError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Automatically confirm the email
    })

    if (userError) throw userError

    if (userData.user) {
      // Create a profile for the user
      const { error: profileError } = await adminSupabase.from("profiles").insert([
        {
          id: userData.user.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (profileError) throw profileError
    }

    return { success: true, user: userData.user }
  } catch (error: any) {
    console.error("Error creating user:", error.message)
    return { success: false, error: error.message }
  }
}

export async function confirmAllUsers() {
  try {
    // Get all users without confirmed emails
    const { data: users, error: usersError } = await adminSupabase.auth.admin.listUsers()

    if (usersError) throw usersError

    let confirmedCount = 0

    // Confirm each user's email
    for (const user of users.users) {
      if (!user.email_confirmed_at) {
        const { error } = await adminSupabase.auth.admin.updateUserById(user.id, {
          email_confirm: true,
        })

        if (!error) confirmedCount++
      }
    }

    return { success: true, confirmedCount }
  } catch (error: any) {
    console.error("Error confirming users:", error.message)
    return { success: false, error: error.message }
  }
}

export async function ensureUserProfiles() {
  try {
    // Get all users
    const { data: users, error: usersError } = await adminSupabase.auth.admin.listUsers()

    if (usersError) throw usersError

    let createdCount = 0

    // For each user, check if they have a profile
    for (const user of users.users) {
      const { data: profile, error: profileError } = await adminSupabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code === "PGRST116") {
        // Profile doesn't exist, create one
        const firstName = user.email ? user.email.split("@")[0].split(".")[0] : "User"
        const lastName =
          user.email && user.email.split("@")[0].split(".")[1] ? user.email.split("@")[0].split(".")[1] : "User"

        const { error } = await adminSupabase.from("profiles").insert([
          {
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        if (!error) createdCount++
      }
    }

    return { success: true, createdCount }
  } catch (error: any) {
    console.error("Error ensuring user profiles:", error.message)
    return { success: false, error: error.message }
  }
}
