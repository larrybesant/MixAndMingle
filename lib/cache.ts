import { redis } from "./redis"

type CacheOptions = {
  expirationSeconds?: number
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    return data as T
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error)
    return null
  }
}

export async function setCache<T>(key: string, data: T, options: CacheOptions = {}): Promise<boolean> {
  try {
    if (options.expirationSeconds) {
      await redis.set(key, data, { ex: options.expirationSeconds })
    } else {
      await redis.set(key, data)
    }
    return true
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error)
    return false
  }
}

export async function deleteCache(key: string): Promise<boolean> {
  try {
    await redis.del(key)
    return true
  } catch (error) {
    console.error(`Error deleting cache for key ${key}:`, error)
    return false
  }
}
