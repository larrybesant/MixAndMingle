import Redis from "ioredis"

// Redis client instance
let redisClient: Redis.Redis | null = null

/**
 * getRedis
 *
 * Returns a Redis instance, creating a new one if it doesn't exist.
 * This implements a singleton pattern to reuse the connection.
 */
export const getRedis = (): Redis.Redis => {
  if (redisClient) {
    return redisClient
  }

  // Ensure the REDIS_CONNECTION_STRING environment variable is set.
  const connectionString = process.env.REDIS_CONNECTION_STRING || process.env.REDIS_TOKEN

  // Debug log to verify the environment variable
  console.log("Redis connection string:", connectionString ? "Set (value hidden)" : "Not set")

  if (!connectionString) {
    throw new Error("Missing REDIS_CONNECTION_STRING or REDIS_TOKEN environment variable")
  }

  // Create a new Redis client using the connection string
  redisClient = new Redis(connectionString, {
    // Add connection options for better reliability
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    connectTimeout: 10000,
  })

  // Add event listeners for connection management
  redisClient.on("error", (err) => {
    console.error("Redis connection error:", err)
  })

  redisClient.on("connect", () => {
    console.log("Connected to Redis")
  })

  redisClient.on("reconnecting", () => {
    console.log("Reconnecting to Redis...")
  })

  return redisClient
}

// Export redis as a named export (this was missing)
export const redis = {
  get: async (key: string) => {
    const client = getRedis()
    return client.get(key)
  },
  set: async (key: string, value: string, expireSeconds?: number) => {
    const client = getRedis()
    if (expireSeconds) {
      return client.set(key, value, "EX", expireSeconds)
    }
    return client.set(key, value)
  },
  del: async (key: string) => {
    const client = getRedis()
    return client.del(key)
  },
  incr: async (key: string) => {
    const client = getRedis()
    return client.incr(key)
  },
  hset: async (key: string, field: string, value: string) => {
    const client = getRedis()
    return client.hset(key, field, value)
  },
  hget: async (key: string, field: string) => {
    const client = getRedis()
    return client.hget(key, field)
  },
  hgetall: async (key: string) => {
    const client = getRedis()
    return client.hgetall(key)
  },
  hdel: async (key: string, field: string) => {
    const client = getRedis()
    return client.hdel(key, field)
  },
  zadd: async (key: string, score: number, member: string) => {
    const client = getRedis()
    return client.zadd(key, score, member)
  },
  zrange: async (key: string, start: number, stop: number, withScores?: boolean) => {
    const client = getRedis()
    if (withScores) {
      return client.zrange(key, start, stop, "WITHSCORES")
    }
    return client.zrange(key, start, stop)
  },
  zrevrange: async (key: string, start: number, stop: number, withScores?: boolean) => {
    const client = getRedis()
    if (withScores) {
      return client.zrevrange(key, start, stop, "WITHSCORES")
    }
    return client.zrevrange(key, start, stop)
  },
  client: () => getRedis(),
}

/**
 * Helper function to safely get JSON data
 */
export async function getJson<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis()
    const data = await redis.get(key)
    return data ? (JSON.parse(data) as T) : null
  } catch (error) {
    console.error(`Error getting JSON for key ${key}:`, error)
    return null
  }
}

/**
 * Helper function to safely set JSON data with optional expiration
 */
export async function setJson<T>(key: string, data: T, expireSeconds?: number): Promise<boolean> {
  try {
    const redis = getRedis()
    const jsonData = JSON.stringify(data)

    if (expireSeconds) {
      await redis.set(key, jsonData, "EX", expireSeconds)
    } else {
      await redis.set(key, jsonData)
    }

    return true
  } catch (error) {
    console.error(`Error setting JSON for key ${key}:`, error)
    return false
  }
}

/**
 * Helper function to check if Redis is connected
 */
export async function isRedisConnected(): Promise<boolean> {
  try {
    const redis = getRedis()
    const pong = await redis.ping()
    return pong === "PONG"
  } catch (error) {
    console.error("Redis connection error:", error)
    return false
  }
}
