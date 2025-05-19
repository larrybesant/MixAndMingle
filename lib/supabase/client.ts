import { createClient as supabaseCreateClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

let supabaseClient: ReturnType<typeof supabaseCreateClient<Database>> | null = null

export function createClient() {
  if (supabaseClient) return supabaseClient

  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Missing Supabase environment variables")
    throw new Error("Missing Supabase environment variables. Please check your .env file.")
  }

  supabaseClient = supabaseCreateClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: "mix-mingle-auth-token",
      },
    },
  )

  return supabaseClient
}
