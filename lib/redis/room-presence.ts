import { redis } from "../redis-client"

const ROOM_PRESENCE_PREFIX = "presence:room:"
const USER_TIMEOUT = 60 // seconds

// Mark a user as present in a room
export async function markUserPresentInRoom(roomId: string, userId: string, userData: any = {}) {
  const key = `${ROOM_PRESENCE_PREFIX}${roomId}`
  const now = Math.floor(Date.now() / 1000)

  // Store user data with timestamp
  await redis.hset(
    key,
    userId,
    JSON.stringify({
      ...userData,
      lastSeen: now,
    }),
  )

  // Set expiration on the hash if it's new
  const ttl = await redis.ttl(key)
  if (ttl < 0) {
    await redis.expire(key, USER_TIMEOUT * 2) // Set hash to expire after double the user timeout
  }
}

// Get all users present in a room
export async function getUsersInRoom(roomId: string) {
  const key = `${ROOM_PRESENCE_PREFIX}${roomId}`
  const now = Math.floor(Date.now() / 1000)
  const cutoff = now - USER_TIMEOUT

  // Get all user data
  const usersData = await redis.hgetall(key)
  if (!usersData) return []

  const activeUsers = []
  const inactiveUsers = []

  // Process each user
  for (const [userId, dataString] of Object.entries(usersData)) {
    const data = JSON.parse(dataString as string)

    if (data.lastSeen > cutoff) {
      // User is active
      activeUsers.push({
        userId,
        ...data,
        active: true,
      })
    } else {
      // User is inactive, mark for removal
      inactiveUsers.push(userId)
    }
  }

  // Remove inactive users
  if (inactiveUsers.length > 0) {
    await redis.hdel(key, ...inactiveUsers)
  }

  return activeUsers
}

// Remove a user from a room
export async function removeUserFromRoom(roomId: string, userId: string) {
  const key = `${ROOM_PRESENCE_PREFIX}${roomId}`
  await redis.hdel(key, userId)
}
