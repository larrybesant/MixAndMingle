"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SubscriptionPlans() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubscribe = async (plan: "premium" | "vip") => {
    if (!user) {
      router.push("/login")
      return
    }

    setIsLoading(plan)

    // In a real app, this would redirect to Stripe checkout
    // For demo purposes, we'll just update the user's subscription status
    try {
      const userRef = doc(db, "users", user.uid)

      if (plan === "premium") {
        await updateDoc(userRef, {
          isPremium: true,
          isVIP: false,
          subscriptionPlan: "premium",
          subscriptionDate: new Date().toISOString(),
        })
      } else if (plan === "vip") {
        await updateDoc(userRef, {
          isPremium: true,
          isVIP: true,
          subscriptionPlan: "vip",
          subscriptionDate: new Date().toISOString(),
        })
      }

      toast({
        title: "Subscription updated",
        description: `You are now subscribed to the ${plan.toUpperCase()} plan.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update subscription. Please try again.",
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="grid gap-6 pt-4 lg:grid-cols-3 lg:gap-8">
      <Card>
        <CardHeader className="flex flex-col space-y-1.5 p-6">
          <CardTitle className="text-2xl font-bold">Free</CardTitle>
          <CardDescription>Essential features for everyone</CardDescription>
          <div className="mt-4 text-4xl font-bold">$0</div>
          <p className="text-sm text-muted-foreground">Forever free</p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
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
        <CardFooter className="p-6 pt-0">
          <Button className="w-full" variant="outline" disabled>
            Current Plan
          </Button>
        </CardFooter>
      </Card>
      <Card className="border-primary">
        <CardHeader className="flex flex-col space-y-1.5 p-6">
          <CardTitle className="text-2xl font-bold">Premium</CardTitle>
          <CardDescription>Advanced features for enthusiasts</CardDescription>
          <div className="mt-4 text-4xl font-bold">$9.99</div>
          <p className="text-sm text-muted-foreground">Per month</p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
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
        <CardFooter className="p-6 pt-0">
          <Button className="w-full" onClick={() => handleSubscribe("premium")} disabled={isLoading !== null}>
            {isLoading === "premium" ? "Processing..." : "Subscribe Now"}
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-col space-y-1.5 p-6">
          <CardTitle className="text-2xl font-bold">VIP</CardTitle>
          <CardDescription>Ultimate features for power users</CardDescription>
          <div className="mt-4 text-4xl font-bold">$19.99</div>
          <p className="text-sm text-muted-foreground">Per month</p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
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
        <CardFooter className="p-6 pt-0">
          <Button className="w-full" onClick={() => handleSubscribe("vip")} disabled={isLoading !== null}>
            {isLoading === "vip" ? "Processing..." : "Go VIP"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
