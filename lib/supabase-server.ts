import { createClient as supabaseCreateClient } from "@supabase/supabase-js"

// Export the createClient function as required by the error message
export const createClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase URL or Key")
  }

  return supabaseCreateClient(supabaseUrl, supabaseKey)
}

// Keep the original function for backward compatibility
export function initializeSupabaseClient() {
  return createClient()
}
