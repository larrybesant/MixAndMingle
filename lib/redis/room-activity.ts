import { redis } from "./client"

const ROOM_USERS_PREFIX = "room:users:"
const ROOM_MESSAGES_PREFIX = "room:messages:"
const MAX_MESSAGES = 50

// Add user to a room
export async function joinRoom(roomId: string, userId: string) {
  const key = `${ROOM_USERS_PREFIX}${roomId}`
  await redis.sadd(key, userId)
}

// Remove user from a room
export async function leaveRoom(roomId: string, userId: string) {
  const key = `${ROOM_USERS_PREFIX}${roomId}`
  await redis.srem(key, userId)
}

// Get all users in a room
export async function getRoomUsers(roomId: string) {
  const key = `${ROOM_USERS_PREFIX}${roomId}`
  return await redis.smembers(key)
}

// Add a message to a room
export async function addRoomMessage(roomId: string, message: any) {
  const key = `${ROOM_MESSAGES_PREFIX}${roomId}`

  // Add message to the list
  await redis.lpush(key, JSON.stringify(message))

  // Trim to keep only the most recent messages
  await redis.ltrim(key, 0, MAX_MESSAGES - 1)
}

// Get recent messages from a room
export async function getRoomMessages(roomId: string, limit = MAX_MESSAGES) {
  const key = `${ROOM_MESSAGES_PREFIX}${roomId}`
  const messages = await redis.lrange(key, 0, limit - 1)

  return messages.map((msg) => JSON.parse(msg as string))
}
