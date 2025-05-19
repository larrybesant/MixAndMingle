import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import Stripe from "stripe"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const { sender_id, recipient_id, amount, currency = "USD", description } = await request.json()

    if (!sender_id || !recipient_id || !amount) {
      return NextResponse.json({ error: "Sender ID, recipient ID, and amount are required" }, { status: 400 })
    }

    // Get sender and recipient details
    const [senderResult, recipientResult] = await Promise.all([
      supabase.from("profiles").select("username, email").eq("id", sender_id).single(),
      supabase.from("profiles").select("username").eq("id", recipient_id).single(),
    ])

    if (senderResult.error || !senderResult.data) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 })
    }

    if (recipientResult.error || !recipientResult.data) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
    }

    const sender = senderResult.data
    const recipient = recipientResult.data

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        sender_id,
        recipient_id,
        description: description || `Payment from ${sender.username} to ${recipient.username}`,
      },
      receipt_email: sender.email, // Send receipt to sender
    })

    // Record the payment in the database
    const { data, error } = await supabase
      .from("payments")
      .insert([
        {
          sender_id,
          recipient_id,
          amount,
          currency,
          status: "pending",
          payment_intent_id: paymentIntent.id,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        payment: data,
        clientSecret: paymentIntent.client_secret,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: error.message || "Failed to create payment" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        sender:sender_id (id, username, avatar_url),
        recipient:recipient_id (id, username, avatar_url)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ payments: data })
  } catch (error: any) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch payments" }, { status: 500 })
  }
}
