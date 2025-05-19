import { supabase } from "@/utils/supabase-client"

// Rate limit types
type RateLimitType = "chat_message" | "stream_join" | "login_attempt" | "api_request"

// Rate limit configurations
const RATE_LIMITS = {
  chat_message: { maxRequests: 10, windowSeconds: 30 },
  stream_join: { maxRequests: 5, windowSeconds: 60 },
  login_attempt: { maxRequests: 5, windowSeconds: 300 },
  api_request: { maxRequests: 100, windowSeconds: 60 },
}

/**
 * Checks if a user has exceeded their rate limit
 * @param userId The user ID to check
 * @param type The type of rate limit to check
 * @returns Whether the user has exceeded their rate limit
 */
export async function isRateLimited(userId: string, type: RateLimitType): Promise<boolean> {
  try {
    const { maxRequests, windowSeconds } = RATE_LIMITS[type]
    const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString()

    // Check rate limit in the database
    const { count, error } = await supabase
      .from("rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("type", type)
      .gt("created_at", windowStart)

    if (error) {
      console.error("Error checking rate limit:", error)
      // If there's an error, allow the request to proceed
      return false
    }

    return count !== null && count >= maxRequests
  } catch (error) {
    console.error("Error in rate limit check:", error)
    // If there's an error, allow the request to proceed
    return false
  }
}

/**
 * Records a rate-limited action
 * @param userId The user ID performing the action
 * @param type The type of rate limit
 * @param ipAddress Optional IP address for additional tracking
 */
export async function recordRateLimitedAction(userId: string, type: RateLimitType, ipAddress?: string): Promise<void> {
  try {
    await supabase.from("rate_limits").insert({
      user_id: userId,
      type,
      ip_address: ipAddress,
    })
  } catch (error) {
    console.error("Error recording rate limited action:", error)
  }
}

/**
 * Cleans up old rate limit records
 * Should be run periodically via a cron job
 */
export async function cleanupRateLimits(): Promise<void> {
  try {
    // Delete records older than 1 day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    await supabase.from("rate_limits").delete().lt("created_at", oneDayAgo)
  } catch (error) {
    console.error("Error cleaning up rate limits:", error)
  }
}
