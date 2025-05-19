import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Server-side authentication utilities
export async function getServerUser() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function requireAuth() {
  const user = await getServerUser()

  if (!user) {
    redirect("/signin")
  }

  return user
}

export async function requireAdmin() {
  const user = await requireAuth()

  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (!data?.is_admin) {
    redirect("/dashboard")
  }

  return user
}
