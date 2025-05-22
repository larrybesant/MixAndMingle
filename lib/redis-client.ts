import { Redis } from "@upstash/redis"

// Initialize Redis client using environment variables
export const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.REDIS_TOKEN || "",
})

// Helper function to check if Redis is connected
export async function isRedisConnected() {
  try {
    const pong = await redis.ping()
    return pong === "PONG"
  } catch (error) {
    console.error("Redis connection error:", error)
    return false
  }
}
