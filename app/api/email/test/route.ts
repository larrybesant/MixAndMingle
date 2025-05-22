import { NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/email/send-email"

export async function POST(request: Request) {
  try {
    // Get email from request body
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Send test welcome email
    const result = await sendWelcomeEmail({
      to: email,
      name: name || "Mix & Mingle User",
      verificationLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://djmixandmingle.com"}/verify?token=test-token`,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to send email",
          details: result.error,
          code: result.code,
          response: result.response,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: result.messageId,
    })
  } catch (error: any) {
    console.error("Test email error:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
