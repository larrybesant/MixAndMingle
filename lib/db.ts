import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Create a SQL client with the Neon connection
export const sql = neon(process.env.DATABASE_URL!)

// Create a Drizzle client using the SQL client
export const db = drizzle(sql)

// Helper function to test the database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`
    return { success: true, timestamp: result[0].now }
  } catch (error) {
    console.error("Database connection error:", error)
    return { success: false, error }
  }
}
