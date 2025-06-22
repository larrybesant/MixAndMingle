import { z } from "zod"
import { type NextRequest, NextResponse } from "next/server"
import { BetaTestingEmail } from "@/lib/email/beta-testing"
import { supabaseAdmin } from "@/lib/supabase/server"
import * as Sentry from '@sentry/nextjs';

const FeedbackSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  feedback: z.string().min(1),
})

/**
 * TODO: Add rate limiting to prevent spam/abuse (see push/subscribe example).
 * TODO: Integrate analytics event for feedback submission (e.g., Segment, Amplitude).
 * TODO: Add advanced monitoring/logging for production (Datadog, LogRocket, etc).
 */
/**
 * Handles feedback POST requests with validation, error logging, and confirmation email.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, feedback } = FeedbackSchema.parse(body)

    // Store feedback in database (server-side client)
    const { error: dbError } = await supabaseAdmin.from("beta_feedback").insert({
      name,
      email,
      feedback,
      submitted_at: new Date().toISOString(),
    })

    if (dbError) {
      Sentry.captureException(dbError);
      console.error("Database error:", dbError)
    }

    // Send confirmation email
    await BetaTestingEmail.sendFeedbackConfirmation(email, name, feedback)

    return NextResponse.json({ success: true })
  } catch (error) {
    Sentry.captureException(error);
    console.error("Feedback submission error:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}

/**
 * Handles unsupported GET requests.
 */
export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 })
}
