import { NextResponse } from "next/server"

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: {},
    supabase: {},
    auth: {},
    tables: {},
    storage: {},
    summary: {},
  }

  try {
    // 1. Check Environment Variables
    console.log("🔍 Checking environment variables...")
    const requiredVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "DATABASE_URL",
    ]

    results.environment = {
      required: {},
      optional: {},
    }

    requiredVars.forEach((varName) => {
      const value = process.env[varName]
      results.environment.required[varName] = {
        exists: !!value,
        preview: value ? `${value.substring(0, 20)}...` : "NOT SET",
      }
    })

    // 2. Check Supabase Connection
    console.log("🔗 Testing Supabase connection...")
    try {
      const { createClient } = await import("@supabase/supabase-js")

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        results.supabase = {
          connected: false,
          error: "Missing Supabase environment variables",
        }
      } else {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

        // Test basic connection by trying to access profiles table
        const { data, error } = await supabase.from("profiles").select("count(*)").limit(1)

        if (error) {
          if (error.code === "42P01") {
            results.supabase = {
              connected: true,
              tablesExist: false,
              message: "Connection works but profiles table does not exist",
            }
          } else {
            results.supabase = {
              connected: false,
              error: error.message,
              code: error.code,
            }
          }
        } else {
          results.supabase = {
            connected: true,
            tablesExist: true,
            profileCount: data?.[0]?.count || 0,
          }
        }
      }
    } catch (err) {
      results.supabase = {
        connected: false,
        error: `Connection failed: ${err}`,
      }
    }

    // 3. Check Database Tables
    console.log("🗄️ Checking database tables...")
    if (results.supabase.connected) {
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

      const tables = ["profiles", "dj_rooms", "messages", "matches", "swipes"]
      results.tables = {}

      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select("count(*)").limit(1)

          if (error) {
            if (error.code === "42P01") {
              results.tables[table] = { exists: false, status: "Table does not exist" }
            } else {
              results.tables[table] = { exists: false, status: `Error: ${error.message}` }
            }
          } else {
            results.tables[table] = { exists: true, status: "Table exists and accessible" }
          }
        } catch (err) {
          results.tables[table] = { exists: false, status: `Check failed: ${err}` }
        }
      }
    }

    // 4. Generate Summary
    const hasSupabaseVars =
      results.environment.required["NEXT_PUBLIC_SUPABASE_URL"].exists &&
      results.environment.required["NEXT_PUBLIC_SUPABASE_ANON_KEY"].exists

    const tablesExist = Object.values(results.tables).some((table: any) => table.exists)

    if (!hasSupabaseVars) {
      results.summary = {
        status: "CRITICAL",
        message: "Missing Supabase environment variables",
        nextSteps: [
          "Add NEXT_PUBLIC_SUPABASE_URL to environment variables",
          "Add NEXT_PUBLIC_SUPABASE_ANON_KEY to environment variables",
        ],
      }
    } else if (!results.supabase.connected) {
      results.summary = {
        status: "ERROR",
        message: "Cannot connect to Supabase",
        nextSteps: ["Verify Supabase URL and API key are correct", "Check Supabase project status"],
      }
    } else if (!tablesExist) {
      results.summary = {
        status: "SETUP_NEEDED",
        message: "Supabase connected but database tables need to be created",
        nextSteps: ["Run database setup script", "Create profiles table", "Set up RLS policies"],
      }
    } else {
      results.summary = {
        status: "READY",
        message: "System is ready for development!",
        nextSteps: ["Test user authentication", "Create your first profile"],
      }
    }
  } catch (error) {
    results.summary = {
      status: "ERROR",
      message: `Diagnostic failed: ${error}`,
      nextSteps: ["Check server logs for more details"],
    }
  }

  return NextResponse.json(results, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
