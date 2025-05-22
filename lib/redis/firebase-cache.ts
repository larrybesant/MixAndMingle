import { redis } from "./client"

// Cache TTL in seconds
const DEFAULT_TTL = 3600 // 1 hour

/**
 * Get data from cache or fetch from Firebase
 */
export async function getCachedData<T>(key: string, fetchFn: () => Promise<T>, ttl: number = DEFAULT_TTL): Promise<T> {
  try {
    // Try to get from cache first
    const cachedData = await redis.get(key)

    if (cachedData) {
      return JSON.parse(cachedData as string) as T
    }

    // If not in cache, fetch from Firebase
    const data = await fetchFn()

    // Store in cache
    await redis.set(key, JSON.stringify(data), { ex: ttl })

    return data
  } catch (error) {
    console.error(`Cache error for ${key}:`, error)
    // On cache error, fall back to direct fetch
    return fetchFn()
  }
}

/**
 * Invalidate a cache entry
 */
export async function invalidateCache(key: string): Promise<boolean> {
  try {
    await redis.del(key)
    return true
  } catch (error) {
    console.error(`Error invalidating cache for ${key}:`, error)
    return false
  }
}

/**
 * Invalidate multiple cache entries by pattern
 */
export async function invalidateCacheByPattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern)

    if (keys.length === 0) {
      return 0
    }

    // Delete all matching keys
    const pipeline = redis.pipeline()
    keys.forEach((key) => pipeline.del(key))

    const results = await pipeline.exec()
    return keys.length
  } catch (error) {
    console.error(`Error invalidating cache by pattern ${pattern}:`, error)
    return 0
  }
}
