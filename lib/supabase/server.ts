import { createServerClient as supabaseCreateServerClient, type CookieOptions } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export function createServerClient() {
  const cookieStore = cookies()
  return supabaseCreateServerClient<Database>({
    cookies: () => ({
      get: (name: string) => {
        const value = cookieStore.get(name)?.getValue()

        if (!value) {
          return null
        }

        return {
          name,
          value,
        }
      },
      set: (name: string, value: string, options?: CookieOptions) => {
        cookieStore.set({ name, value, ...options })
      },
      remove: (name: string, options?: CookieOptions) => {
        cookieStore.delete({ name, ...options })
      },
    }),
  })
}

// Add the missing export
export const createClient = createServerClient
