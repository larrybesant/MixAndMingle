import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export function createServerClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerComponentClient({
    cookies: () => cookieStore,
  })
}

export async function checkSupabaseConnection() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

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
