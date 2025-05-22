import { getRedis } from "@/lib/redis"

interface CacheOptions {
  ttl?: number // Time to live in seconds
  staleWhileRevalidate?: boolean
}

const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  ttl: 300, // 5 minutes default
  staleWhileRevalidate: true,
}

/**
 * Cached fetch function that stores API responses in Redis
 */
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  cacheOptions: CacheOptions = DEFAULT_CACHE_OPTIONS,
): Promise<T> {
  const cacheKey = `api:${url}:${JSON.stringify(options.body || {})}`
  const { ttl, staleWhileRevalidate } = { ...DEFAULT_CACHE_OPTIONS, ...cacheOptions }

  try {
    // Try to get from cache first
    const redis = getRedis()
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      // If we have cached data, return it immediately
      const parsedData = JSON.parse(cachedData) as T

      // If staleWhileRevalidate is enabled, fetch fresh data in the background
      if (staleWhileRevalidate) {
        refreshCache<T>(url, options, cacheKey, ttl).catch((err) =>
          console.error(`Background refresh failed for ${url}:`, err),
        )
      }

      return parsedData
    }

    // If not in cache, fetch fresh data
    return await fetchAndCache<T>(url, options, cacheKey, ttl)
  } catch (error) {
    console.error(`Cache error for ${url}:`, error)

    // On cache error, fall back to direct fetch
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }
    return (await response.json()) as T
  }
}

/**
 * Helper function to fetch and cache data
 */
async function fetchAndCache<T>(url: string, options: RequestInit, cacheKey: string, ttl?: number): Promise<T> {
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as T

  // Store in cache
  const redis = getRedis()
  if (ttl) {
    await redis.set(cacheKey, JSON.stringify(data), "EX", ttl)
  } else {
    await redis.set(cacheKey, JSON.stringify(data))
  }

  return data
}

/**
 * Helper function to refresh cache in the background
 */
async function refreshCache<T>(url: string, options: RequestInit, cacheKey: string, ttl?: number): Promise<void> {
  try {
    await fetchAndCache<T>(url, options, cacheKey, ttl)
  } catch (error) {
    console.error(`Cache refresh failed for ${url}:`, error)
    // Don't throw - this is a background operation
  }
}
