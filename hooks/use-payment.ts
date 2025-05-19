"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { useAuth } from "@/contexts/auth-context"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface PaymentOptions {
  recipientId: string
  amount: number
  currency?: string
  description?: string
}

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const makePayment = async ({ recipientId, amount, currency = "USD", description }: PaymentOptions) => {
    if (!user) {
      setError("You must be logged in to make a payment")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create a payment intent on the server
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_id: user.id,
          recipient_id: recipientId,
          amount,
          currency,
          description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment")
      }

      // Load Stripe
      const stripe = await stripePromise

      if (!stripe) {
        throw new Error("Stripe failed to load")
      }

      // Confirm the payment with Stripe
      const { error: stripeError } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: {
            // In a real implementation, you would use Stripe Elements
            // This is just a placeholder
            token: "tok_visa",
          },
          billing_details: {
            name: user.user_metadata?.username || user.email,
          },
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      return {
        success: true,
        payment: data.payment,
      }
    } catch (err: any) {
      setError(err.message)
      return {
        success: false,
        error: err.message,
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    makePayment,
    isLoading,
    error,
  }
}
