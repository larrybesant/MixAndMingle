"use server"

import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * Creates a payment intent for tipping a DJ
 */
export async function createTipPaymentIntent(formData: FormData) {
  try {
    const supabase = createServerClient()

    const amount = Number(formData.get("amount"))
    const recipientId = formData.get("recipientId") as string
    const senderId = formData.get("senderId") as string
    const description = (formData.get("description") as string) || undefined

    if (!amount || !recipientId || !senderId) {
      throw new Error("Amount, recipient ID, and sender ID are required")
    }

    // Verify the recipient exists
    const { data: recipient } = await supabase.from("profiles").select("username").eq("id", recipientId).single()

    if (!recipient) {
      throw new Error("Recipient not found")
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: "usd",
      metadata: {
        paymentType: "tip",
        recipientId,
        senderId,
        description: description || `Tip for ${recipient.username}`,
      },
    })

    // Record the payment in the database
    await supabase.from("payments").insert([
      {
        sender_id: senderId,
        recipient_id: recipientId,
        amount,
        currency: "USD",
        status: "pending",
        payment_intent_id: paymentIntent.id,
      },
    ])

    revalidatePath("/dj/[id]", "page")

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error: any) {
    console.error("Error creating payment intent:", error)
    return {
      success: false,
      error: error.message || "Failed to create payment",
    }
  }
}
