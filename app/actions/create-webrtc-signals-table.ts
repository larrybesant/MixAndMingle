"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function createWebRTCSignalsTable() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase.rpc("create_webrtc_signals_table", {})

  if (error) {
    console.error("Error creating WebRTC signals table:", error)
    return { error: error.message }
  }

  return { success: true }
}
