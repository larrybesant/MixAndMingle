import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = {
  default: 60, // 60 requests per minute for most endpoints
  auth: 10, // 10 requests per minute for auth endpoints
  stream: 120, // 120 requests per minute for streaming endpoints
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get request body
    const body = await request.json()
    const { endpoint, ip } = body

    if (!endpoint || !ip) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Determine rate limit based on endpoint type
    let maxRequests = RATE_LIMIT_MAX_REQUESTS.default
    if (endpoint.startsWith("/api/auth")) {
      maxRequests = RATE_LIMIT_MAX_REQUESTS.auth
    } else if (endpoint.startsWith("/api/streams") || endpoint.startsWith("/api/ws")) {
      maxRequests = RATE_LIMIT_MAX_REQUESTS.stream
    }

    // Calculate the start of the current window
    const now = Date.now()
    const windowStart = now - RATE_LIMIT_WINDOW

    // Check if IP is in the rate limit table
    const { data: existingData, error: fetchError } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("ip", ip)
      .eq("endpoint", endpoint)
      .gt("timestamp", new Date(windowStart).toISOString())

    if (fetchError) {
      console.error("Error fetching rate limit data:", fetchError)
      // Allow the request if we can't check the rate limit
      return NextResponse.json({ allowed: true })
    }

    // Count requests in the current window
    const requestCount = existingData?.length || 0

    // Check if rate limit is exceeded
    if (requestCount >= maxRequests) {
      return NextResponse.json({
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        reset: new Date(windowStart + RATE_LIMIT_WINDOW).toISOString(),
      })
    }

    // Record this request
    const { error: insertError } = await supabase.from("rate_limits").insert({
      ip,
      endpoint,
      timestamp: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error recording rate limit:", insertError)
    }

    return NextResponse.json({
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - requestCount - 1,
      reset: new Date(windowStart + RATE_LIMIT_WINDOW).toISOString(),
    })
  } catch (error) {
    console.error("Error in rate limit API:", error)
    // Allow the request if there's an error in the rate limiting system
    return NextResponse.json({ allowed: true })
  }
}
