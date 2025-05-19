import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Use a more specific type for the client
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function createClient() {
  if (supabaseClient) return supabaseClient

  // Use the createClientComponentClient from auth-helpers-nextjs
  // This ensures proper integration with Next.js and avoids duplicate instances
  supabaseClient = createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options: {
      auth: {
        persistSession: true,
        storageKey: "mix-mingle-auth-token",
      },
    },
  })

  return supabaseClient
}
