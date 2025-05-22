import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { hash, compare } from "bcrypt"
import { verifyResetToken } from "@/lib/auth/tokens"
import { sendPasswordChangedEmail } from "@/lib/email/send-email"

// Validation schema for password reset request
const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

/**
 * Handler for password reset requests
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = resetPasswordSchema.safeParse(body)

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

    const { token, password } = validationResult.data

    // Verify the reset token
    const tokenData = await verifyResetToken(token)

    if (!tokenData || !tokenData.valid) {
      return NextResponse.json(
        {
          success: false,
          error: tokenData?.error || "Invalid or expired reset token",
        },
        { status: 400 },
      )
    }

    const { userId, email } = tokenData

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Check if the new password is different from the current one
    const isSamePassword = await compare(password, user.passwordHash)

    if (isSamePassword) {
      return NextResponse.json(
        {
          success: false,
          error: "New password must be different from your current password",
        },
        { status: 400 },
      )
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12)

    // Update the user's password
    await db.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      },
    })

    // Invalidate all existing sessions for security
    await db.session.deleteMany({
      where: { userId },
    })

    // Send confirmation email
    await sendPasswordChangedEmail(email)

    // Log the password change for security auditing
    await db.securityLog.create({
      data: {
        userId,
        action: "PASSWORD_RESET",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    })
  } catch (error) {
    console.error("Password reset error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    )
  }
}
