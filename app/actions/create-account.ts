"use server"

import { createClient } from "@supabase/supabase-js"

export async function createAccount(email: string, name: string, password?: string) {
  try {
    // Validate inputs
    if (!email || !email.includes("@")) {
      return { success: false, message: "Invalid email address" }
    }

    if (!name || name.trim().length < 2) {
      return { success: false, message: "Name is required (minimum 2 characters)" }
    }

    // Generate a random password if none provided
    const finalPassword =
      password || Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4)

    // Create a Supabase client with admin privileges
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create the user with email confirmation disabled
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password: finalPassword,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: name,
        is_beta_tester: true,
      },
    })

    if (userError) throw userError

    if (userData.user) {
      // Create a profile for the user
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userData.user.id,
          full_name: name,
          email: email,
          is_beta_tester: true,
          beta_joined_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (profileError) throw profileError

      return {
        success: true,
        message: "Account created successfully!",
        password: password ? undefined : finalPassword,
      }
    }

    return { success: false, message: "Failed to create user" }
  } catch (error: any) {
    console.error("Error creating account:", error)
    return {
      success: false,
      message: error.message || "An error occurred while creating the account.",
    }
  }
}
