import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from("profiles")
      .select("count(*)")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed",
          error: error.message,
          suggestion: "Please run the profiles table setup SQL in Supabase",
        },
        { status: 500 },
      );
    }

    const count =
      Array.isArray(data) &&
      data.length > 0 &&
      typeof data[0].count === "number"
        ? data[0].count
        : 0;
    return NextResponse.json({
      status: "healthy",
      message: "Database connection successful",
      profiles_count: count,
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        message: "Unexpected database error",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
