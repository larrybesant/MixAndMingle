import { neon } from "@neondatabase/serverless"
import { supabase } from "@/lib/supabase/client"

// Neon connection (for direct SQL queries)
const sql = neon(process.env.DATABASE_URL!)

export { sql, supabase }

// Test both connections
export async function testConnections() {
  try {
    // Test Supabase
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const supabaseTest = {}
    const { error: supabaseError } = await supabase.from("profiles").select("count").limit(1)

    console.log("✅ Supabase connected:", !supabaseError)

    // Test Neon
    const neonTest = await sql`SELECT 1 as test`
    console.log("✅ Neon connected:", neonTest.length > 0)

    return {
      supabase: !supabaseError,
      neon: neonTest.length > 0,
    }
  } catch (error) {
    console.error("❌ Database connection error:", error)
    return {
      supabase: false,
      neon: false,
    }
  }
}
