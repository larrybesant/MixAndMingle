"use server"

import { createClient } from "@supabase/supabase-js"

export async function createAdminAccount(formData: FormData) {
  try {
    // Extract form data
    const email = formData.get("email") as string
    const name = formData.get("name") as string
    const password = (formData.get("password") as string) || null

    // Validate inputs
    if (!email || !email.includes("@")) {
      return { success: false, message: "Invalid email address" }
    }

    if (!name || name.trim().length < 2) {
      return { success: false, message: "Name is required (minimum 2 characters)" }
    }

    // Check for required environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
      return { success: false, message: "Server configuration error: Missing service role key" }
    }

    // Generate a random password if none provided
    const finalPassword =
      password ||
      Math.random().toString(36).slice(-8) +
        Math.random().toString(36).toUpperCase().slice(-4) +
        Math.floor(Math.random() * 10)

    // Create a Supabase client with admin privileges
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
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

    if (userError) {
      console.error("Error creating user:", userError)
      return { success: false, message: userError.message }
    }

    if (!userData.user) {
      return { success: false, message: "Failed to create user" }
    }

    // Split the name into first and last name
    const nameParts = name.trim().split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

    // Create a profile for the user - adjusted to match your schema
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: userData.user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        is_beta_tester: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])

    if (profileError) {
      console.error("Error creating profile:", profileError)
      return { success: false, message: `User created but profile failed: ${profileError.message}` }
    }

    return {
      success: true,
      message: "Account created successfully!",
      password: password ? undefined : finalPassword,
    }
  } catch (error: any) {
    console.error("Error creating account:", error)
    return {
      success: false,
      message: error.message || "An error occurred while creating the account.",
    }
  }
}
