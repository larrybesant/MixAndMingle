"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-client"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, ArrowRight } from "lucide-react"
import { useABTestEvent } from "@/hooks/use-ab-test-event"

export function MinimalOnboarding() {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { logEvent, logConversion } = useABTestEvent("onboarding-experience", "minimal")

  // Log impression when component mounts
  useState(() => {
    logEvent("view")
  })

  const handleComplete = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to complete onboarding.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Mark onboarding as completed
      await updateDoc(doc(db, "users", user.uid), {
        hasCompletedOnboarding: true,
        onboardingCompletedAt: serverTimestamp(),
        onboardingVariant: "minimal",
      })

      // Log conversion
      logConversion({ completed: true })

      toast({
        title: "You're all set!",
        description: "Jump right in and start exploring Mix & Mingle.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error completing onboarding:", error)
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome to Mix & Mingle!</h2>
          <p className="text-muted-foreground">
            The social platform where you can chat, join rooms, and connect with friends.
          </p>
        </div>

        <div className="space-y-4 my-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Chat with friends</h3>
              <p className="text-sm text-muted-foreground">Create private or join public chat rooms</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Join DJ rooms</h3>
              <p className="text-sm text-muted-foreground">Experience live music with other enthusiasts</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Video conversations</h3>
              <p className="text-sm text-muted-foreground">Connect face-to-face with HD video</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-center pb-6">
        <Button size="lg" onClick={handleComplete} disabled={loading}>
          Get Started <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
