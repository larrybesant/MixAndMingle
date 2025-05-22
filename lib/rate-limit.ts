import { redis } from "./redis"

export async function rateLimit(identifier: string, limit = 10, windowInSeconds = 60) {
  const key = `rate-limit:${identifier}`

  // Get current count
  const current = (await redis.get(key)) as number | null

  // If over limit, return error
  if (current !== null && current >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: await redis.ttl(key),
    }
  }

  // Use multi to ensure atomic operations
  const multi = redis.multi()

  if (current === null) {
    // First request in window
    multi.set(key, 1)
    multi.expire(key, windowInSeconds)
  } else {
    // Increment existing counter
    multi.incr(key)
  }

  await multi.exec()

  return {
    success: true,
    remaining: limit - (current === null ? 1 : current + 1),
    reset: await redis.ttl(key),
  }
}
