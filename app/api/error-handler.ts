import { NextResponse } from "next/server"
import { logger } from "@/lib/logging"

type ApiHandler = (req: Request, params?: any) => Promise<Response>

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req: Request, params?: any) => {
    try {
      // Set a timeout for the handler
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Request timeout"))
        }, 10000) // 10 second timeout
      })

      // Race the handler against the timeout
      const response = await Promise.race([handler(req, params), timeoutPromise])

      return response
    } catch (error) {
      // Log the error
      logger.error({
        message: "API request error",
        action: req.method,
        resource: new URL(req.url).pathname,
        error,
        details: { params },
      })

      // Return an appropriate error response
      if (error instanceof Error) {
        if (error.message === "Request timeout") {
          return NextResponse.json({ error: "Request timed out" }, { status: 408 })
        }

        // Handle specific error types
        if (error.message.includes("not found")) {
          return NextResponse.json({ error: "Resource not found" }, { status: 404 })
        }

        if (error.message.includes("unauthorized") || error.message.includes("not authenticated")) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (error.message.includes("forbidden")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        if (error.message.includes("validation")) {
          return NextResponse.json({ error: "Validation error", details: error.message }, { status: 400 })
        }
      }

      // Generic error response
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}
