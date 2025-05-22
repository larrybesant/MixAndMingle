import { type NextRequest, NextResponse } from "next/server"
import { getRedis } from "@/lib/redis"
import { authOptions } from "@/lib/auth/auth-options"
import { getServerSession } from "next-auth"

// Helper function to get online users in a room
async function getOnlineUsersInRoom(roomId: string) {
  try {
    const redis = getRedis()
    const now = Date.now()
    const cutoff = now - 5 * 60 * 1000 // 5 minutes ago

    // Remove users who haven't been seen in 5 minutes
    await redis.zremrangebyscore(`room:${roomId}:online`, 0, cutoff)

    // Get remaining users
    const userIds = await redis.zrange(`room:${roomId}:online`, 0, -1)

    return userIds
  } catch (error) {
    console.error("Error getting online users:", error)
    return []
  }
}

// Helper function to mark a user as online in a room
async function markUserOnline(userId: string, roomId: string) {
  try {
    const redis = getRedis()
    const now = Date.now()

    // Add user to room's online users sorted set with score = timestamp
    await redis.zadd(`room:${roomId}:online`, now, userId)

    // Also increment room visit counter
    await redis.hincrby(`room:${roomId}:stats`, "visits", 1)

    return true
  } catch (error) {
    console.error("Error marking user online:", error)
    return false
  }
}

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

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user data from request
    const userData = await request.json()

    // Mark user as present
    await markUserOnline(session.user.id, params.roomId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating presence:", error)
    return NextResponse.json({ error: "Failed to update presence" }, { status: 500 })
  }
}

export async function GET(_request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const roomId = params.roomId

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
    }

    const onlineUsers = await getOnlineUsersInRoom(roomId)

    return NextResponse.json({
      roomId,
      users: onlineUsers,
      count: onlineUsers.length,
    })
  } catch (error) {
    console.error("Error in presence GET endpoint:", error)
    return NextResponse.json({ error: "Failed to get online users" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Remove user from room
    await markUserOffline(session.user.id, params.roomId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing presence:", error)
    return NextResponse.json({ error: "Failed to remove presence" }, { status: 500 })
  }
}
