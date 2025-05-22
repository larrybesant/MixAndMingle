import { db } from "@/lib/db"
import { randomBytes } from "crypto"

/**
 * Generate a secure random token for password reset
 */
export function generateResetToken(): string {
  return randomBytes(32).toString("hex")
}

/**
 * Create a password reset token for a user
 * @param userId - The user's ID
 * @param email - The user's email
 * @returns The generated token
 */
export async function createResetToken(userId: string, email: string): Promise<string> {
  // Generate a secure random token
  const token = generateResetToken()

  // Set token expiration (1 hour from now)
  const expires = new Date()
  expires.setHours(expires.getHours() + 1)

  // Store the token in the database
  await db.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: token,
      passwordResetTokenExpiry: expires,
    },
  })

  return token
}

/**
 * Verify a password reset token
 * @param token - The token to verify
 * @returns Object containing verification result and user data if valid
 */
export async function verifyResetToken(token: string): Promise<{
  valid: boolean
  userId?: string
  email?: string
  error?: string
}> {
  try {
    // Find user with this token
    const user = await db.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return {
        valid: false,
        error: "Invalid or expired reset token",
      }
    }

    return {
      valid: true,
      userId: user.id,
      email: user.email,
    }
  } catch (error) {
    console.error("Token verification error:", error)
    return {
      valid: false,
      error: "Error verifying token",
    }
  }
}

/**
 * Invalidate a password reset token
 * @param userId - The user's ID
 */
export async function invalidateResetToken(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
    },
  })
}
