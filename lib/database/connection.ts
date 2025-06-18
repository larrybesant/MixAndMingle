import { createClient } from "@supabase/supabase-js"
import { neon } from "@neondatabase/serverless"

// Supabase connection (for auth and real-time)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Neon connection (for direct SQL queries)
const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Test both connections
export async function testConnections() {
  try {
    // Test Supabase
    const { data: supabaseTest, error: supabaseError } = await supabase.from("profiles").select("count").limit(1)

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
