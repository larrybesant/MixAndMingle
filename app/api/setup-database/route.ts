import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function POST() {
  try {
    // Check if profiles table exists
    const { error: checkError } = await supabase.from("profiles").select("count(*)").limit(1)

    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: "Database already set up",
      })
    }

    // If table doesn't exist, we need to create it
    // This would typically be done in Supabase dashboard
    return NextResponse.json({
      success: false,
      message: "Profiles table needs to be created in Supabase dashboard",
      instructions: [
        "1. Go to your Supabase dashboard",
        "2. Navigate to SQL Editor",
        "3. Run the SQL script to create the profiles table",
      ],
    })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check database setup",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Check database status
    const { error: profilesError } = await supabase.from("profiles").select("count(*)").limit(1)

    return NextResponse.json({
      profiles_table: !profilesError,
      supabase_connected: true,
      message: profilesError ? "Profiles table needs to be created" : "Database ready",
    })
  } catch (error) {
    return NextResponse.json(
      {
        profiles_table: false,
        supabase_connected: false,
        error: "Failed to connect to Supabase",
      },
      { status: 500 },
    )
  }
}
