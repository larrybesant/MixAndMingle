"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function createDbFunctions() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Create function to increment viewer count
  await supabase.rpc("create_increment_viewer_count_function", {})

  // Create function to decrement viewer count
  await supabase.rpc("create_decrement_viewer_count_function", {})

  return { success: true }
}
