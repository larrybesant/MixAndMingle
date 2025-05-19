import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { logger } from "@/lib/logging"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get the current user for authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get the request body
    const { to, subject, html, emailId } = await request.json()

    // Validate the request
    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "user@example.com",
        pass: process.env.SMTP_PASSWORD || "password",
      },
    })

    // Send the email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "Social Event Planning <noreply@social-event-planning.com>",
      to,
      subject,
      html,
    })

    // Update the email log if an ID was provided
    if (emailId) {
      await supabase
        .from("email_logs")
        .update({
          status: "sent",
        })
        .eq("id", emailId)
    }

    logger.info({
      message: "Email sent successfully",
      userId: user.id,
      action: "send",
      resource: "email",
      details: { messageId: info.messageId },
    })

    return NextResponse.json({ success: true, messageId: info.messageId })
  } catch (error: any) {
    logger.error({
      message: "Error sending email",
      action: "send",
      resource: "email",
      error: error.message,
    })

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
