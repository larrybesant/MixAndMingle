import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulate API health check
    const healthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        authentication: "active",
        webrtc: "available",
      },
    }

    return NextResponse.json(healthCheck)
  } catch (error) {
    return NextResponse.json({ error: "API health check failed" }, { status: 500 })
  }
}
