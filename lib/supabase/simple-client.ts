"use client"

import { createClient } from "@supabase/supabase-js"

// Only create client on the browser side
let supabaseClient: any = null

export const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    throw new Error("Supabase client can only be used on the client side")
  }

  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables")
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseClient
}
