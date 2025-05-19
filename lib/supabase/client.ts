"use client"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a single supabase client for the entire client-side application
let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createBrowserClient() {
  if (clientInstance) return clientInstance

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables")
  }

  clientInstance = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )

  return clientInstance
}
