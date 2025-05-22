import { type NextRequest, NextResponse } from "next/server"
import { getBetaTesterCount, MAX_BETA_TESTERS } from "@/lib/firebase/beta-access"
import { getRedis } from "@/lib/redis"

// Valid beta codes - in a real app, these would be stored in a database
// and potentially be single-use or have expiration dates
const VALID_BETA_CODES = [
  "PHOENIX", // General access code
]

// Rate limiting configuration
const RATE_LIMIT = {
  window: 60, // 1 minute
  max: 5, // 5 attempts per minute
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const ip = request.ip || "anonymous"
    const redis = getRedis()
    const rateLimitKey = `beta:ratelimit:${ip}`

    // Increment the counter
    const attempts = await redis.incr(rateLimitKey)

    // Set expiry on first request
    if (attempts === 1) {
      await redis.expire(rateLimitKey, RATE_LIMIT.window)
    }

    // If over limit, return 429 Too Many Requests
    if (attempts > RATE_LIMIT.max) {
      const ttl = await redis.ttl(rateLimitKey)
      return NextResponse.json(
        {
          error: "Too many attempts. Please try again later.",
          retryAfter: ttl,
        },
        { status: 429 },
      )
    }

    // Get the beta code from the request body
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Beta code is required" }, { status: 400 })
    }

    // Check if the code is valid
    const isValidCode = VALID_BETA_CODES.includes(code.toUpperCase())

    if (!isValidCode) {
      return NextResponse.json({ error: "Invalid beta code" }, { status: 403 })
    }

    // Check if beta tester limit has been reached
    const currentCount = await getBetaTesterCount()
    if (currentCount >= MAX_BETA_TESTERS) {
      return NextResponse.json(
        {
          error: "Beta testing enrollment is full. Please check back for future updates.",
          betaFull: true,
        },
        { status: 403 },
      )
    }

    // If we get here, the code is valid and there's space
    return NextResponse.json({
      success: true,
      currentCount,
    })
  } catch (error) {
    console.error("Beta verification error:", error)
    return NextResponse.json({ error: "An error occurred while verifying the beta code" }, { status: 500 })
  }
}
