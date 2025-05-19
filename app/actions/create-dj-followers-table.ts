"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import fs from "fs"
import path from "path"

export async function createDjFollowersTable() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
  if (!profile?.is_admin) {
    return { error: "Not authorized" }
  }

  try {
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "app/actions/create-dj-followers-table.sql")
    const sqlQuery = fs.readFileSync(sqlFilePath, "utf8")

    // Execute the SQL query
    const { error } = await supabase.rpc("exec_sql", { sql: sqlQuery })

    if (error) {
      console.error("Error creating dj_followers table:", error)
      return { error: "Failed to create dj_followers table" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating dj_followers table:", error)
    return { error: "Failed to create dj_followers table" }
  }
}
