"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Create a singleton instance to prevent multiple instances warning
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>()
  }
  return supabaseClient
}
