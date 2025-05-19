import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

// Add this line to fix the missing export
export { createClient as createServerClient }

export async function checkSupabaseConnection() {
  try {
    const supabase = createClient()

    // Try a simple query to check connection
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      return {
        connected: false,
        error: error.message,
      }
    }

    return {
      connected: true,
      data,
    }
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}
