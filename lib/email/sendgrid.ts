import type { MailDataRequired } from "@sendgrid/mail"
import sgMail from "@sendgrid/mail"

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
} else {
  console.warn("SENDGRID_API_KEY is not set. Email functionality will not work.")
}

// Email sender address
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@djmixandmingle.com"
const FROM_NAME = "Mix & Mingle"

/**
 * Send an email using SendGrid
 */
export async function sendEmail(options: {
  to: string | string[]
  subject: string
  text: string
  html: string
  from?: string
  replyTo?: string
  attachments?: any[]
  categories?: string[]
}) {
  try {
    const { to, subject, text, html, from, replyTo, attachments, categories } = options

    const msg: MailDataRequired = {
      to,
      from: {
        email: from || FROM_EMAIL,
        name: FROM_NAME,
      },
      subject,
      text,
      html,
    }

    // Add optional fields if provided
    if (replyTo) {
      msg.replyTo = replyTo
    }

    if (attachments && attachments.length > 0) {
      msg.attachments = attachments
    }

    if (categories && categories.length > 0) {
      msg.categories = categories
    }

    // Add tracking settings
    msg.trackingSettings = {
      clickTracking: {
        enable: true,
        enableText: true,
      },
      openTracking: {
        enable: true,
      },
    }

    const response = await sgMail.send(msg)
    return {
      success: true,
      messageId: response[0]?.headers["x-message-id"],
      response,
    }
  } catch (error: any) {
    console.error("SendGrid email error:", error)

    // Return detailed error for debugging
    return {
      success: false,
      error: error.message,
      code: error.code,
      response: error.response?.body,
    }
  }
}

/**
 * Send a batch of emails using SendGrid
 */
export async function sendBatchEmails(emails: MailDataRequired[]) {
  try {
    // Set default from address if not specified
    emails = emails.map((email) => ({
      ...email,
      from: email.from || {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
    }))

    const response = await sgMail.send(emails)
    return {
      success: true,
      response,
    }
  } catch (error: any) {
    console.error("SendGrid batch email error:", error)
    return {
      success: false,
      error: error.message,
      code: error.code,
      response: error.response?.body,
    }
  }
}
