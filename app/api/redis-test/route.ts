import { NextResponse } from "next/server"
import { redis, isRedisConnected } from "@/lib/redis/client"

export async function GET() {
  try {
    // Check if Redis is connected
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

    // Test setting and getting a value
    const testKey = "test:connection"
    const testValue = `Connection test at ${new Date().toISOString()}`

    await redis.set(testKey, testValue, { ex: 60 }) // Expire in 60 seconds
    const retrievedValue = await redis.get(testKey)

    return NextResponse.json({
      status: "success",
      message: "Redis connection successful",
      test: {
        key: testKey,
        originalValue: testValue,
        retrievedValue,
        match: testValue === retrievedValue,
      },
    })
  } catch (error) {
    console.error("Redis test error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Redis test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
