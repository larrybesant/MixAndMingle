import { sendEmail } from "./sendgrid"
import {
  generateWelcomeEmail,
  generatePasswordResetEmail,
  generateEventInvitationEmail,
  generateNotificationEmail,
  generatePasswordChangedEmail,
} from "./templates"

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(options: {
  to: string
  name: string
  verificationLink?: string
}) {
  const { to, name, verificationLink } = options
  const { subject, text, html } = generateWelcomeEmail(name, verificationLink)

  return sendEmail({
    to,
    subject,
    text,
    html,
    categories: ["welcome"],
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(options: {
  to: string
  resetLink: string
}) {
  const { to, resetLink } = options
  const { subject, text, html } = generatePasswordResetEmail(to, resetLink)

  return sendEmail({
    to,
    subject,
    text,
    html,
    categories: ["password-reset"],
  })
}

/**
 * Send password changed confirmation email
 */
export async function sendPasswordChangedEmail(options: {
  to: string
  name: string
}) {
  const { to, name } = options
  const { subject, text, html } = generatePasswordChangedEmail(name)

  return sendEmail({
    to,
    subject,
    text,
    html,
    categories: ["password-changed"],
  })
}

/**
 * Send event invitation email
 */
export async function sendEventInvitationEmail(options: {
  to: string
  recipientName: string
  senderName: string
  eventName: string
  eventDate: string
  eventLocation: string
  eventLink: string
}) {
  const { to, recipientName, senderName, eventName, eventDate, eventLocation, eventLink } = options
  const { subject, text, html } = generateEventInvitationEmail(
    recipientName,
    senderName,
    eventName,
    eventDate,
    eventLocation,
    eventLink,
  )

  return sendEmail({
    to,
    subject,
    text,
    html,
    categories: ["event-invitation"],
  })
}

/**
 * Send notification email
 */
export async function sendNotificationEmail(options: {
  to: string
  recipientName: string
  notificationType: "comment" | "like" | "follow" | "mention"
  actorName: string
  contentSnippet?: string
  actionLink: string
}) {
  const { to, recipientName, notificationType, actorName, contentSnippet = "", actionLink } = options
  const { subject, text, html } = generateNotificationEmail(
    recipientName,
    notificationType,
    actorName,
    contentSnippet,
    actionLink,
  )

  return sendEmail({
    to,
    subject,
    text,
    html,
    categories: ["notification", notificationType],
  })
}
