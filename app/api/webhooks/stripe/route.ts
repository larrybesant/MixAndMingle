import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await request.text()
    const signature = headers().get("stripe-signature") as string

    if (!webhookSecret) {
      console.error("Webhook secret is not configured")
      return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 500 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    console.log(`Received event: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, supabase)
        break

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, supabase)
        break

      case "payment_intent.created":
        console.log(`Payment intent created: ${(event.data.object as Stripe.PaymentIntent).id}`)
        break

      case "charge.succeeded":
        await handleChargeSucceeded(event.data.object as Stripe.Charge, supabase)
        break

      case "charge.failed":
        await handleChargeFailed(event.data.object as Stripe.Charge, supabase)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return NextResponse.json({ error: "Failed to handle webhook" }, { status: 500 })
  }
}

// Handler for successful payments
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof createServerClient>,
) {
  console.log(`Payment succeeded: ${paymentIntent.id}`)

  // Extract metadata
  const { sender_id, recipient_id } = paymentIntent.metadata

  if (sender_id && recipient_id) {
    // Update payment status in database
    const { error } = await supabase
      .from("payments")
      .update({
        status: "completed",
      })
      .eq("payment_intent_id", paymentIntent.id)

    if (error) {
      console.error("Error updating payment status:", error)
    }
  }
}

// Handler for failed payments
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof createServerClient>,
) {
  console.log(`Payment failed: ${paymentIntent.id}`)

  // Extract metadata
  const { sender_id, recipient_id } = paymentIntent.metadata

  if (sender_id && recipient_id) {
    // Update payment status in database
    const { error } = await supabase
      .from("payments")
      .update({
        status: "failed",
      })
      .eq("payment_intent_id", paymentIntent.id)

    if (error) {
      console.error("Error updating payment status:", error)
    }
  }
}

// Handler for successful charges
async function handleChargeSucceeded(charge: Stripe.Charge, supabase: ReturnType<typeof createServerClient>) {
  console.log(`Charge succeeded: ${charge.id}`)

  // If the charge is related to a payment intent, update the payment record
  if (charge.payment_intent) {
    const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent.id

    const { error } = await supabase
      .from("payments")
      .update({
        status: "completed",
      })
      .eq("payment_intent_id", paymentIntentId)

    if (error) {
      console.error("Error updating payment status:", error)
    }
  }
}

// Handler for failed charges
async function handleChargeFailed(charge: Stripe.Charge, supabase: ReturnType<typeof createServerClient>) {
  console.log(`Charge failed: ${charge.id}`)

  // If the charge is related to a payment intent, update the payment record
  if (charge.payment_intent) {
    const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent.id

    const { error } = await supabase
      .from("payments")
      .update({
        status: "failed",
      })
      .eq("payment_intent_id", paymentIntentId)

    if (error) {
      console.error("Error updating payment status:", error)
    }
  }
}
