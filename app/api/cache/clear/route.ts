import { type NextRequest, NextResponse } from "next/server"
import { getRedis } from "@/lib/redis"

export async function POST(request: NextRequest) {
  try {
    // Get the pattern to clear from the request body
    const body = await request.json()
    const { pattern } = body

    if (!pattern) {
      return NextResponse.json({ error: "Pattern is required" }, { status: 400 })
    }

    const redis = getRedis()

    // Get all keys matching the pattern
    const keys = await redis.keys(pattern)

    if (keys.length === 0) {
      return NextResponse.json({ message: "No keys found matching pattern" })
    }

    // Delete all matching keys
    const deleted = await redis.del(...keys)

    return NextResponse.json({
      success: true,
      deleted,
      keys,
    })
  } catch (error) {
    console.error("Error clearing cache:", error)
    return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 })
  }
}
