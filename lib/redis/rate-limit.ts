import { redis } from "./client"

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
  limit: number
}

/**
 * Rate limit a request by identifier
 */
export async function rateLimit(identifier: string, limit = 10, windowInSeconds = 60): Promise<RateLimitResult> {
  const key = `rate-limit:${identifier}`

  try {
    // Get current count
    const current = (await redis.get(key)) as number | null

    // If over limit, return error
    if (current !== null && current >= limit) {
      const ttl = await redis.ttl(key)
      return {
        success: false,
        remaining: 0,
        reset: ttl,
        limit,
      }
    }

    // Use pipeline to ensure atomic operations
    const pipeline = redis.pipeline()

    if (current === null) {
      // First request in window
      pipeline.set(key, 1, { ex: windowInSeconds })
      pipeline.incr(key)
    } else {
      // Increment existing counter
      pipeline.incr(key)
    }

    await pipeline.exec()

    const newCount = (await redis.get(key)) as number
    const ttl = await redis.ttl(key)

    return {
      success: true,
      remaining: Math.max(0, limit - newCount),
      reset: ttl,
      limit,
    }
  } catch (error) {
    console.error(`Rate limit error for ${identifier}:`, error)
    // On error, allow the request
    return {
      success: true,
      remaining: limit - 1,
      reset: windowInSeconds,
      limit,
    }
  }
}
