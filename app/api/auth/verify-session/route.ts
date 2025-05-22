import { NextResponse } from "next/server"
import { redis } from "@/lib/redis/client"

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ valid: false, error: "Session ID is required" }, { status: 400 })
    }

    // Check if session exists in Redis
    const session = await redis.get(`session:${sessionId}`)

    if (!session) {
      return NextResponse.json({ valid: false, error: "Invalid session" }, { status: 401 })
    }

    const sessionData = JSON.parse(session as string)

    // Check if session is expired
    const now = Date.now()
    if (sessionData.expiresAt < now) {
      // Clean up expired session
      await redis.del(`session:${sessionId}`)
      return NextResponse.json({ valid: false, error: "Session expired" }, { status: 401 })
    }

    // Optionally refresh session expiration
    sessionData.expiresAt = now + 24 * 60 * 60 * 1000 // 24 hours
    await redis.set(`session:${sessionId}`, JSON.stringify(sessionData), { ex: 86400 }) // 24 hours

    return NextResponse.json({ valid: true, user: sessionData.user })
  } catch (error) {
    console.error("Error verifying session:", error)
    return NextResponse.json({ valid: false, error: "Error verifying session" }, { status: 500 })
  }
}
