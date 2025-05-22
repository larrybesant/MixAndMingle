import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit } from "@/lib/redis/rate-limit"

// Define which paths to apply rate limiting to
const RATE_LIMITED_PATHS = ["/api/rooms", "/api/notifications", "/api/users"]

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes that need protection
  const path = request.nextUrl.pathname

  if (!RATE_LIMITED_PATHS.some((prefix) => path.startsWith(prefix))) {
    return NextResponse.next()
  }

  // Get IP for rate limiting
  const ip = request.ip || "127.0.0.1"

  // Get rate limit results
  const result = await rateLimit(`${ip}:${path}`, 30, 60) // 30 requests per minute

  // Return rate limit headers
  const response = NextResponse.next()

  response.headers.set("X-RateLimit-Limit", result.limit.toString())
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
  response.headers.set("X-RateLimit-Reset", result.reset.toString())

  // If rate limit exceeded, return 429 Too Many Requests
  if (!result.success) {
    return new NextResponse(JSON.stringify({ error: "Too many requests", retryAfter: result.reset }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": result.reset.toString(),
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
      },
    })
  }

  return response
}

export const config = {
  matcher: ["/api/:path*"],
}
