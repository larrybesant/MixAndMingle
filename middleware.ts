import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// In-memory store for rate limiting
// In production, use Redis or another distributed store
const rateLimitStore: Record<string, { count: number; timestamp: number }> = {}

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds
const RATE_LIMIT_MAX = 100 // Maximum requests per window
const API_RATE_LIMIT_MAX = 50 // Stricter limit for API routes

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Get client IP
  const ip = request.ip || "anonymous"
  const path = request.nextUrl.pathname

  // Skip rate limiting for static assets
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/static/") ||
    path.endsWith(".ico") ||
    path.endsWith(".png") ||
    path.endsWith(".jpg") ||
    path.endsWith(".svg")
  ) {
    return response
  }

  // Determine if this is an API route
  const isApiRoute = path.startsWith("/api/")
  const maxRequests = isApiRoute ? API_RATE_LIMIT_MAX : RATE_LIMIT_MAX

  // Get current timestamp
  const now = Date.now()

  // Initialize or update rate limit data for this IP
  if (!rateLimitStore[ip] || now - rateLimitStore[ip].timestamp > RATE_LIMIT_WINDOW) {
    rateLimitStore[ip] = { count: 1, timestamp: now }
  } else {
    rateLimitStore[ip].count++
  }

  // Add rate limit headers
  response.headers.set("X-RateLimit-Limit", maxRequests.toString())
  response.headers.set("X-RateLimit-Remaining", Math.max(0, maxRequests - rateLimitStore[ip].count).toString())
  response.headers.set(
    "X-RateLimit-Reset",
    Math.ceil((rateLimitStore[ip].timestamp + RATE_LIMIT_WINDOW) / 1000).toString(),
  )

  // Check if rate limit exceeded
  if (rateLimitStore[ip].count > maxRequests) {
    // Clean up old entries periodically
    if (now % (RATE_LIMIT_WINDOW * 10) < 1000) {
      Object.keys(rateLimitStore).forEach((key) => {
        if (now - rateLimitStore[key].timestamp > RATE_LIMIT_WINDOW) {
          delete rateLimitStore[key]
        }
      })
    }

    // Return rate limit exceeded response
    return new NextResponse(
      JSON.stringify({
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
          "X-RateLimit-Limit": maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil((rateLimitStore[ip].timestamp + RATE_LIMIT_WINDOW) / 1000).toString(),
        },
      },
    )
  }

  return response
}

export const config = {
  matcher: [
    // Apply to all routes except static assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
