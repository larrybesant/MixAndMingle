import { Redis } from "@upstash/redis"

// Initialize Redis client using environment variables
// These are automatically set by the Upstash integration
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  // Add retry options for better reliability
  retry: {
    retries: 3,
    backoff: (retryCount) => Math.min(Math.exp(retryCount) * 50, 1000),
  },
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
