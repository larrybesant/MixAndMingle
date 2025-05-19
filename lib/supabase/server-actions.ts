"use server"

import { createServerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// This file contains server-only code and actions
export async function getServerSupabase() {
  const cookieStore = cookies()
  return createServerClient<Database>({
    cookies: () => cookieStore,
  })
}

export async function getCurrentUser() {
  const supabase = await getServerSupabase()
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function getUserProfile(userId: string) {
  const supabase = await getServerSupabase()
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single()
  return data
}

export async function checkIsAdmin(userId: string) {
  const supabase = await getServerSupabase()
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", userId).single()
  return data?.is_admin || false
}
