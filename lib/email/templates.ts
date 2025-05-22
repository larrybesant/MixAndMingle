import { APP_NAME } from "@/app/config"

// Base URL for links in emails
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://djmixandmingle.com"

/**
 * Generate welcome email template
 */
export function generateWelcomeEmail(name: string, verificationLink?: string) {
  const subject = `Welcome to ${APP_NAME}!`

  const text = `
    Hi ${name},
    
    Welcome to ${APP_NAME}! We're excited to have you join our community.
    
    ${verificationLink ? `Please verify your email by clicking this link: ${verificationLink}` : ""}
    
    Get started by exploring upcoming DJ events or creating your profile.
    
    Thanks,
    The ${APP_NAME} Team
  `

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Welcome to ${APP_NAME}!</h2>
      <p>Hi ${name},</p>
      <p>We're excited to have you join our community of music lovers and DJs!</p>
      
      ${
        verificationLink
          ? `
        <p>Please verify your email address by clicking the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
        </p>
        <p style="font-size: 12px; color: #666;">If the button above doesn't work, copy and paste this link into your browser: ${verificationLink}</p>
      `
          : ""
      }
      
      <p>Get started by exploring upcoming DJ events or creating your profile.</p>
      
      <p>Thanks,<br>The ${APP_NAME} Team</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
        <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        <p>
          <a href="${BASE_URL}/terms" style="color: #4f46e5; text-decoration: none;">Terms</a> · 
          <a href="${BASE_URL}/privacy" style="color: #4f46e5; text-decoration: none;">Privacy</a>
        </p>
      </div>
    </div>
  `

  return { subject, text, html }
}

/**
 * Generate password reset email template
 */
export function generatePasswordResetEmail(email: string, resetLink: string) {
  const subject = `Reset Your ${APP_NAME} Password`

  const text = `
    Hello,
    
    You requested to reset your password for your ${APP_NAME} account (${email}).
    
    Please click the link below to reset your password:
    ${resetLink}
    
    This link will expire in 1 hour.
    
    If you didn't request this, please ignore this email.
    
    Thanks,
    The ${APP_NAME} Team
  `

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Reset Your Password</h2>
      <p>Hello,</p>
      <p>You requested to reset your password for your ${APP_NAME} account (${email}).</p>
      <p>Please click the button below to reset your password:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
      </p>
      <p>This link will expire in <strong>1 hour</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Thanks,<br>The ${APP_NAME} Team</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
        <p>${resetLink}</p>
      </div>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
        <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        <p>
          <a href="${BASE_URL}/terms" style="color: #4f46e5; text-decoration: none;">Terms</a> · 
          <a href="${BASE_URL}/privacy" style="color: #4f46e5; text-decoration: none;">Privacy</a>
        </p>
      </div>
    </div>
  `

  return { subject, text, html }
}

/**
 * Generate event invitation email template
 */
export function generateEventInvitationEmail(
  recipientName: string,
  senderName: string,
  eventName: string,
  eventDate: string,
  eventLocation: string,
  eventLink: string,
) {
  const subject = `${senderName} invited you to ${eventName}`

  const text = `
    Hi ${recipientName},
    
    ${senderName} has invited you to join ${eventName}!
    
    Event Details:
    - Name: ${eventName}
    - Date: ${eventDate}
    - Location: ${eventLocation}
    
    View the event and RSVP here: ${eventLink}
    
    We hope to see you there!
    
    The ${APP_NAME} Team
  `

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">You're Invited!</h2>
      <p>Hi ${recipientName},</p>
      <p><strong>${senderName}</strong> has invited you to join <strong>${eventName}</strong>!</p>
      
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Event Details</h3>
        <p><strong>Name:</strong> ${eventName}</p>
        <p><strong>Date:</strong> ${eventDate}</p>
        <p><strong>Location:</strong> ${eventLocation}</p>
      </div>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${eventLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Event & RSVP</a>
      </p>
      
      <p>We hope to see you there!</p>
      
      <p>The ${APP_NAME} Team</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
        <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        <p>
          <a href="${BASE_URL}/terms" style="color: #4f46e5; text-decoration: none;">Terms</a> · 
          <a href="${BASE_URL}/privacy" style="color: #4f46e5; text-decoration: none;">Privacy</a> ·
          <a href="${BASE_URL}/unsubscribe?email={{email}}" style="color: #4f46e5; text-decoration: none;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `

  return { subject, text, html }
}

/**
 * Generate notification email template
 */
export function generateNotificationEmail(
  recipientName: string,
  notificationType: "comment" | "like" | "follow" | "mention",
  actorName: string,
  contentSnippet: string,
  actionLink: string,
) {
  let actionText = ""
  let subject = ""

  switch (notificationType) {
    case "comment":
      actionText = "commented on your post"
      subject = `${actorName} commented on your post`
      break
    case "like":
      actionText = "liked your post"
      subject = `${actorName} liked your post`
      break
    case "follow":
      actionText = "started following you"
      subject = `${actorName} is now following you`
      break
    case "mention":
      actionText = "mentioned you in a post"
      subject = `${actorName} mentioned you in a post`
      break
  }

  const text = `
    Hi ${recipientName},
    
    ${actorName} ${actionText}.
    
    ${contentSnippet ? `"${contentSnippet}"` : ""}
    
    View it here: ${actionLink}
    
    The ${APP_NAME} Team
  `

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">New Notification</h2>
      <p>Hi ${recipientName},</p>
      
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p><strong>${actorName}</strong> ${actionText}.</p>
        ${contentSnippet ? `<p style="font-style: italic;">"${contentSnippet}"</p>` : ""}
      </div>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${actionLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Now</a>
      </p>
      
      <p>The ${APP_NAME} Team</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
        <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        <p>
          <a href="${BASE_URL}/terms" style="color: #4f46e5; text-decoration: none;">Terms</a> · 
          <a href="${BASE_URL}/privacy" style="color: #4f46e5; text-decoration: none;">Privacy</a> ·
          <a href="${BASE_URL}/notifications/settings" style="color: #4f46e5; text-decoration: none;">Notification Settings</a>
        </p>
      </div>
    </div>
  `

  return { subject, text, html }
}

/**
 * Generate password changed email
 */
export function generatePasswordChangedEmail(name: string) {
  const subject = "Your password has been changed"

  const text = `
    Hello ${name},
    
    Your password for Mix & Mingle has been successfully changed.
    
    If you did not make this change, please contact our support team immediately.
    
    Best regards,
    The Mix & Mingle Team
  `

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Changed</h2>
      <p>Hello ${name},</p>
      <p>Your password for Mix & Mingle has been successfully changed.</p>
      <p><strong>If you did not make this change, please contact our support team immediately.</strong></p>
      <p>Best regards,<br>The Mix & Mingle Team</p>
    </div>
  `

  return { subject, text, html }
}
