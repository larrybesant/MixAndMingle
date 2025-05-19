import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

if (!process.env.SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL environment variable")
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
}

// Create a Supabase client with the service role key for server-side operations
export const supabaseAdmin = createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Create a Supabase client with the anon key for server components
export const createServerClient = () => {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
}

export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.delete({ name, ...options })
      },
    },
  })
}
