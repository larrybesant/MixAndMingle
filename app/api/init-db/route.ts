import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/init-db"

export async function POST() {
  try {
    const result = await initializeDatabase()

    if (result.success) {
      return NextResponse.json({
        status: "success",
        message: result.message,
      })
    } else {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to initialize database",
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
