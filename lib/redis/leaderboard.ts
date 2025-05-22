import { redis } from "./client"

const DJ_LEADERBOARD_KEY = "leaderboard:djs"

/**
 * Increment a DJ's score in the leaderboard
 */
export async function incrementDJScore(djId: string, increment = 1): Promise<number> {
  try {
    // Increment the DJ's score
    const newScore = await redis.zincrby(DJ_LEADERBOARD_KEY, increment, djId)

    return typeof newScore === "number" ? newScore : 0
  } catch (error) {
    console.error("Error incrementing DJ score:", error)
    return 0
  }
}

/**
 * Get a DJ's current score
 */
export async function getDJScore(djId: string): Promise<number> {
  try {
    // Get the DJ's score
    const score = await redis.zscore(DJ_LEADERBOARD_KEY, djId)

    return score ? Number(score) : 0
  } catch (error) {
    console.error("Error getting DJ score:", error)
    return 0
  }
}

/**
 * Get top DJs from the leaderboard
 */
export async function getTopDJs(count = 10): Promise<Array<{ id: string; score: number }>> {
  try {
    // Get top DJs with scores
    const results = await redis.zrange(DJ_LEADERBOARD_KEY, 0, count - 1, {
      rev: true,
      withScores: true,
    })

    // Parse results into array of objects
    const topDJs: Array<{ id: string; score: number }> = []

    for (let i = 0; i < results.length; i += 2) {
      topDJs.push({
        id: results[i] as string,
        score: Number(results[i + 1]),
      })
    }

    return topDJs
  } catch (error) {
    console.error("Error getting top DJs:", error)
    return []
  }
}
