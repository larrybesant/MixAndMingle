import { NextResponse } from "next/server"

export async function GET() {
  const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missing.length > 0) {
    return NextResponse.json(
      {
        status: "error",
        message: "Missing required environment variables",
        missing,
        help: "Please check your .env.local file and Vercel environment variables",
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    status: "ok",
    message: "All required environment variables are present",
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + "...",
    has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}
