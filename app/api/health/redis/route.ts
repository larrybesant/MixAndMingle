import { NextResponse } from "next/server"
import { getRedis, isRedisConnected } from "@/lib/redis"

export async function GET() {
  try {
    // Check Redis connection
    const connected = await isRedisConnected()

    if (!connected) {
      return NextResponse.json(
        {
          status: "error",
          message: "Redis connection failed",
        },
        { status: 500 },
      )
    }

    // Get Redis info
    const redis = getRedis()
    const info = await redis.info()

    // Get Redis memory usage
    const memory = await redis.info("memory")

    return NextResponse.json({
      status: "healthy",
      message: "Redis connection successful",
      timestamp: new Date().toISOString(),
      details: {
        memory: memory
          .split("\n")
          .find((line) => line.startsWith("used_memory_human"))
          ?.split(":")[1]
          ?.trim(),
      },
    })
  } catch (error) {
    console.error("Redis health check error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Redis health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
