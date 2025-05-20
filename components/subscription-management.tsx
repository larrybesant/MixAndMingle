"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { stripeService, subscriptionPlans } from "@/lib/stripe-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export function SubscriptionManagement() {
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Fetch user's subscription
  useEffect(() => {
    async function fetchSubscription() {
      if (!user) return

      try {
        const subscriptionData = await stripeService.getSubscription(user.uid)
        setSubscription(subscriptionData)
      } catch (error) {
        console.error("Error fetching subscription:", error)
        setError("Failed to load subscription data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  // Handle subscription
  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push("/login")
      return
    }

    setSubscribing(planId)

    try {
      // In a real implementation, this would redirect to Stripe Checkout
      // For this example, we'll simulate the process

      // Create checkout session
      const sessionId = await stripeService.createCheckoutSession(user.uid, planId)

      // Simulate successful payment
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Process subscription
      await stripeService.processSubscription(user.uid, planId)

      // Update local state
      const plan = subscriptionPlans.find((p) => p.id === planId)
      setSubscription({
        plan: plan?.name.toLowerCase(),
        status: "active",
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isPremium: true,
        isVIP: plan?.name.toLowerCase() === "vip",
      })

      toast({
        title: "Subscription successful",
        description: `You are now subscribed to the ${plan?.name} plan.`,
      })
    } catch (error) {
      console.error("Error subscribing:", error)
      toast({
        variant: "destructive",
        title: "Subscription failed",
        description: "Failed to process subscription. Please try again.",
      })
    } finally {
      setSubscribing(null)
    }
  }

  // Handle cancellation
  const handleCancel = async () => {
    if (!user) return

    try {
      await stripeService.cancelSubscription(user.uid)

      // Update local state
      setSubscription({
        ...subscription,
        status: "canceled",
      })

      toast({
        title: "Subscription canceled",
        description: "Your subscription has been canceled.",
      })
    } catch (error) {
      console.error("Error canceling subscription:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-40">Loading subscription data...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {subscription?.status === "active" && (
        <Alert>
          <AlertTitle>Current Subscription</AlertTitle>
          <AlertDescription>
            You are currently subscribed to the <span className="font-medium">{subscription.plan.toUpperCase()}</span>{" "}
            plan.
            {subscription.periodEnd && (
              <> Your subscription will renew on {new Date(subscription.periodEnd).toLocaleDateString()}.</>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Free Plan */}
        <Card className={!subscription?.isPremium ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Basic features for everyone</CardDescription>
            <div className="mt-4 text-4xl font-bold">$0</div>
            <p className="text-sm text-muted-foreground">Forever free</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Basic user profile</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Join public chat rooms</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Limited audio rooms</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Send basic virtual gifts</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" disabled>
              {!subscription?.isPremium ? (
                <>
                  Current Plan
                  <Badge className="ml-2" variant="outline">
                    Active
                  </Badge>
                </>
              ) : (
                "Free Plan"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className={subscription?.plan === "premium" && subscription?.status === "active" ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>Premium</CardTitle>
            <CardDescription>Advanced features for enthusiasts</CardDescription>
            <div className="mt-4 text-4xl font-bold">$9.99</div>
            <p className="text-sm text-muted-foreground">Per month</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Enhanced user profile</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Create private chat rooms</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Unlimited audio rooms</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>HD video quality</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Premium virtual gifts</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Ad-free experience</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {subscription?.plan === "premium" && subscription?.status === "active" ? (
              <Button className="w-full" variant="outline" onClick={handleCancel}>
                Cancel Subscription
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleSubscribe("premium-monthly")}
                disabled={subscribing !== null}
              >
                {subscribing === "premium-monthly" ? "Processing..." : "Subscribe Now"}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* VIP Plan */}
        <Card className={subscription?.plan === "vip" && subscription?.status === "active" ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>VIP</CardTitle>
            <CardDescription>Ultimate features for power users</CardDescription>
            <div className="mt-4 text-4xl font-bold">$19.99</div>
            <p className="text-sm text-muted-foreground">Per month</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>All Premium features</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Exclusive VIP chat rooms</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>4K video quality</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Exclusive virtual gifts</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Profile boosts</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {subscription?.plan === "vip" && subscription?.status === "active" ? (
              <Button className="w-full" variant="outline" onClick={handleCancel}>
                Cancel Subscription
              </Button>
            ) : (
              <Button className="w-full" onClick={() => handleSubscribe("vip-monthly")} disabled={subscribing !== null}>
                {subscribing === "vip-monthly" ? "Processing..." : "Go VIP"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
