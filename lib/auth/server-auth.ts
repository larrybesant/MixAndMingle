import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import type { Database } from "@/types/supabase"

// Get the current user from the server
export async function getCurrentUser() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  return session.user
}

// Check if a user is an admin
export async function isAdmin(userId: string) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data } = await supabase.from("profiles").select("is_admin").eq("id", userId).single()

  return !!data?.is_admin
}

// Require authentication (redirect if not authenticated)
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/signin")
  }

  return user
}

// Require admin privileges (redirect if not admin)
export async function requireAdmin() {
  const user = await requireAuth()
  const admin = await isAdmin(user.id)

  if (!admin) {
    redirect("/dashboard")
  }

  return user
}
