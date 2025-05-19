import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import nodemailer from "nodemailer"

type EmailOptions = {
  to: string
  subject: string
  template: string
  data: Record<string, any>
  userId?: string
}

export async function sendEmail({ to, subject, template, data, userId }: EmailOptions) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Log the email attempt
  const { data: logData, error: logError } = await supabase
    .from("email_logs")
    .insert({
      recipient_email: to,
      subject,
      template,
      data,
      status: "pending",
      sent_by: userId,
    })
    .select()

  if (logError) {
    console.error("Error logging email:", logError)
  }

  const logId = logData?.[0]?.id

  try {
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Generate HTML content based on template
    // In a real app, you would use a proper templating system
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">${subject}</h1>
        <p>This is a test email for template: ${template}</p>
        <pre>${JSON.stringify(data, null, 2)}</pre>
        <p>In a real implementation, this would be a properly formatted email template.</p>
      </div>
    `

    // Send the email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    })

    // Update the log with success status
    if (logId) {
      await supabase.from("email_logs").update({ status: "sent", updated_at: new Date().toISOString() }).eq("id", logId)
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)

    // Update the log with failure status
    if (logId) {
      await supabase
        .from("email_logs")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
          data: { ...data, error: error instanceof Error ? error.message : "Unknown error" },
        })
        .eq("id", logId)
    }

    throw error
  }
}
