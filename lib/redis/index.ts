import Redis from "ioredis"

// Connection configuration
const getRedisClient = () => {
  // Get connection string from environment variable
  const connectionString = process.env.REDIS_CONNECTION_STRING

  if (!connectionString) {
    console.error("REDIS_CONNECTION_STRING environment variable is not set")
    throw new Error("Redis connection string not found")
  }

  return new Redis(connectionString, {
    // Enable auto-reconnection
    reconnectOnError: (err) => {
      const targetError = "READONLY"
      if (err.message.includes(targetError)) {
        // Only reconnect when the error contains "READONLY"
        return true
      }
      return false
    },
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    // Maximum number of reconnection attempts
    maxRetriesPerRequest: 3,
    // Enable keep-alive to prevent connection timeouts
    keepAlive: 10000,
  })
}

// Create a singleton instance
let redisClient: Redis | null = null

export function getRedis() {
  if (!redisClient) {
    redisClient = getRedisClient()
  }
  return redisClient
}

// Helper function to check if Redis is connected
export async function isRedisConnected() {
  try {
    const client = getRedis()
    const pong = await client.ping()
    return pong === "PONG"
  } catch (error) {
    console.error("Redis connection error:", error)
    return false
  }
}

// Helper function to safely get JSON data
export async function getJson<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis()
    const data = await client.get(key)
    return data ? (JSON.parse(data) as T) : null
  } catch (error) {
    console.error(`Error getting JSON for key ${key}:`, error)
    return null
  }
}

// Helper function to safely set JSON data with optional expiration
export async function setJson<T>(key: string, data: T, expireSeconds?: number) {
  try {
    const client = getRedis()
    const jsonData = JSON.stringify(data)
    if (expireSeconds) {
      return await client.set(key, jsonData, "EX", expireSeconds)
    }
    return await client.set(key, jsonData)
  } catch (error) {
    console.error(`Error setting JSON for key ${key}:`, error)
    return false
  }
}

// Close Redis connection (useful for tests and scripts)
export async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}
