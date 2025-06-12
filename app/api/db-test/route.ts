import { NextResponse } from "next/server"
import { testConnection } from "@/lib/db"

export async function GET() {
  try {
    const result = await testConnection()

    if (result.success) {
      return NextResponse.json({
        status: "connected",
        message: "Successfully connected to the database",
        timestamp: result.timestamp,
      })
    } else {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to connect to the database",
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 },
    )
  }
}
