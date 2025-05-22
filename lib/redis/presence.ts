import { redis } from "./client"

const ONLINE_USERS_KEY = "presence:online"
const ROOM_PRESENCE_PREFIX = "presence:room:"
const USER_TIMEOUT = 60 // seconds

/**
 * Mark a user as online
 */
export async function markUserOnline(userId: string): Promise<boolean> {
  try {
    const now = Math.floor(Date.now() / 1000)

    // Update user's last seen timestamp
    await redis.hset(ONLINE_USERS_KEY, userId, now.toString())

    return true
  } catch (error) {
    console.error("Error marking user online:", error)
    return false
  }
}

/**
 * Mark a user as offline
 */
export async function markUserOffline(userId: string): Promise<boolean> {
  try {
    // Remove user from online users
    await redis.hdel(ONLINE_USERS_KEY, userId)

    return true
  } catch (error) {
    console.error("Error marking user offline:", error)
    return false
  }
}

/**
 * Get all online users (active in the last minute)
 */
export async function getOnlineUsers(): Promise<string[]> {
  try {
    const now = Math.floor(Date.now() / 1000)
    const cutoff = now - USER_TIMEOUT

    // Get all user timestamps
    const users = await redis.hgetall(ONLINE_USERS_KEY)

    if (!users) return []

    // Filter active users
    const activeUsers: string[] = []

    for (const [userId, timestamp] of Object.entries(users)) {
      if (Number.parseInt(timestamp) > cutoff) {
        activeUsers.push(userId)
      }
    }

    return activeUsers
  } catch (error) {
    console.error("Error getting online users:", error)
    return []
  }
}

/**
 * Mark a user as present in a room
 */
export async function joinRoom(userId: string, roomId: string): Promise<boolean> {
  try {
    const key = `${ROOM_PRESENCE_PREFIX}${roomId}`
    const now = Math.floor(Date.now() / 1000)

    // Add user to room
    await redis.hset(key, userId, now.toString())

    return true
  } catch (error) {
    console.error("Error joining room:", error)
    return false
  }
}

/**
 * Remove a user from a room
 */
export async function leaveRoom(userId: string, roomId: string): Promise<boolean> {
  try {
    const key = `${ROOM_PRESENCE_PREFIX}${roomId}`

    // Remove user from room
    await redis.hdel(key, userId)

    return true
  } catch (error) {
    console.error("Error leaving room:", error)
    return false
  }
}

/**
 * Get all users in a room
 */
export async function getUsersInRoom(roomId: string): Promise<string[]> {
  try {
    const key = `${ROOM_PRESENCE_PREFIX}${roomId}`
    const now = Math.floor(Date.now() / 1000)
    const cutoff = now - USER_TIMEOUT

    // Get all user timestamps
    const users = await redis.hgetall(key)

    if (!users) return []

    // Filter active users
    const activeUsers: string[] = []

    for (const [userId, timestamp] of Object.entries(users)) {
      if (Number.parseInt(timestamp) > cutoff) {
        activeUsers.push(userId)
      }
    }

    return activeUsers
  } catch (error) {
    console.error("Error getting users in room:", error)
    return []
  }
}
