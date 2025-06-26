import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET() {
  try {
    // Test basic connection and get count
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed",
          error: error.message,
          suggestion: "Please run the profiles table setup SQL in Supabase",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "healthy",
      message: "Database connection successful",
      profiles_count: count || 0,
    })
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        message: "Unexpected database error",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
