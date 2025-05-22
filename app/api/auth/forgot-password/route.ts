import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { createResetToken } from "@/lib/auth/tokens"
import { sendPasswordResetEmail } from "@/lib/email/send-email"

// Validation schema for forgot password request
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

/**
 * Handler for forgot password requests
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = forgotPasswordSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const { email } = validationResult.data

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // For security reasons, don't reveal if the email exists or not
    // Always return success even if the email doesn't exist
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If your email is registered, you will receive a password reset link shortly",
      })
    }

    // Generate a reset token
    const token = await createResetToken(user.id, user.email)

    // Create reset link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetLink = `${baseUrl}/reset-password?token=${token}`

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetLink)

    // Log the password reset request for security auditing
    await db.securityLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    })

    return NextResponse.json({
      success: true,
      message: "If your email is registered, you will receive a password reset link shortly",
    })
  } catch (error) {
    console.error("Forgot password error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    )
  }
}
