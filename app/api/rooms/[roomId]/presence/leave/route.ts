import { type NextRequest, NextResponse } from "next/server"
import { getRedis } from "@/lib/redis"

// Helper function to mark a user as offline
async function markUserOffline(userId: string, roomId: string) {
  try {
    const redis = getRedis()

    // Remove user from room's online users
    await redis.zrem(`room:${roomId}:online`, userId)

    return true
  } catch (error) {
    console.error("Error marking user offline:", error)
    return false
  }
}

// POST endpoint to mark a user as offline when they leave a room
export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const roomId = params.roomId

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const success = await markUserOffline(userId, roomId)

    if (!success) {
      return NextResponse.json({ error: "Failed to mark user as offline" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in leave presence endpoint:", error)
    return NextResponse.json({ error: "Failed to mark user as offline" }, { status: 500 })
  }
}
