"use server"

import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with admin privileges
const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function resetUserPassword(email: string, newPassword: string) {
  try {
    // Find the user by email
    const { data: userData, error: userError } = await adminSupabase.auth.admin.listUsers()

    if (userError) throw userError

    const user = userData.users.find((u) => u.email === email)

    if (!user) {
      throw new Error(`User with email ${email} not found`)
    }

    // Update the user's password
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })

    if (updateError) throw updateError

    return { success: true }
  } catch (error: any) {
    console.error("Error resetting password:", error.message)
    return { success: false, error: error.message }
  }
}
