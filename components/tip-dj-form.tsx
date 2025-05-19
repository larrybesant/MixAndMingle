"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CardElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

// Load Stripe outside of component to avoid recreating it on each render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface TipDJFormProps {
  djId: string
  djName: string
}

export function TipDJForm({ djId, djName }: TipDJFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <TipDJFormContent djId={djId} djName={djName} />
    </Elements>
  )
}

function TipDJFormContent({ djId, djName }: TipDJFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { user } = useAuth()

  const [amount, setAmount] = useState<number>(5)
  const [message, setMessage] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || !user) {
      setPaymentError("Payment processing is not available. Please try again later.")
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Create a payment intent on the server
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_id: user.id,
          recipient_id: djId,
          amount,
          description: message || `Tip for ${djName}`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment")
      }

      // Confirm the payment with Stripe
      const cardElement = elements.getElement(CardElement)

      if (!cardElement) {
        throw new Error("Card element not found")
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user.user_metadata?.username || user.email,
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent.status === "succeeded") {
        setPaymentSuccess(true)

        // Reset form
        setAmount(5)
        setMessage("")
        cardElement.clear()

        // Refresh the page to show updated tip information
        router.refresh()
      }
    } catch (error: any) {
      console.error("Payment error:", error)
      setPaymentError(error.message || "An error occurred while processing your payment")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!user) {
    return <div>Please log in to send tips</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {paymentSuccess && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
          Your tip was successfully sent to {djName}!
        </div>
      )}

      <div>
        <Label htmlFor="amount">Tip Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="message">Message (Optional)</Label>
        <Input
          id="message"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Add a message for ${djName}...`}
          className="mt-1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="card-element">Card Details</Label>
        <div className="p-3 border rounded-md">
          <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {paymentError && <div className="text-sm text-red-500">{paymentError}</div>}

      <Button type="submit" disabled={!stripe || isProcessing} className="w-full">
        {isProcessing ? "Processing..." : `Send $${amount} Tip`}
      </Button>
    </form>
  )
}
