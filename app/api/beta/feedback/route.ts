import { type NextRequest, NextResponse } from "next/server"
import { BetaTestingEmail } from "@/lib/email/beta-testing"
import { supabase } from "@/lib/supabase/client"

export async function POST(request: NextRequest) {
  try {
    const { name, email, feedback } = await request.json()

    if (!name || !email || !feedback) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Store feedback in database
    const { error: dbError } = await supabase.from("beta_feedback").insert({
      name,
      email,
      feedback,
      submitted_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error("Database error:", dbError)
    }

    // Send confirmation email
    await BetaTestingEmail.sendFeedbackConfirmation(email, name, feedback)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feedback submission error:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}
