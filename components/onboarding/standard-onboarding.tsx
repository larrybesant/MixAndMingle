"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-client"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { useABTestEvent } from "@/hooks/use-ab-test-event"

const onboardingSteps = [
  {
    title: "Welcome to Mix & Mingle!",
    description: "Connect with friends, join chat rooms, and experience premium video and audio conversations.",
    image: "/onboarding-welcome.png",
  },
  {
    title: "Discover DJ Rooms",
    description: "Join live DJ sets from around the world. Chat and mingle with other music lovers.",
    image: "/onboarding-dj.png",
  },
  {
    title: "Chat with Friends",
    description: "Create private chat rooms or join public ones to connect with people who share your interests.",
    image: "/onboarding-chat.png",
  },
  {
    title: "Go Premium",
    description: "Upgrade to Premium or VIP for exclusive features like HD video, private rooms, and more.",
    image: "/onboarding-premium.png",
  },
]

export function StandardOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { logEvent, logConversion } = useABTestEvent("onboarding-experience", "standard")

  useEffect(() => {
    // Log impression when component mounts
    logEvent("view")

    // Calculate progress percentage
    setProgress(((currentStep + 1) / onboardingSteps.length) * 100)
  }, [currentStep, logEvent])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      logEvent("next_step", { step: currentStep + 1 })
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      logEvent("previous_step", { step: currentStep - 1 })
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    logEvent("skip", { step: currentStep })
    completeOnboarding()
  }

  const completeOnboarding = async () => {
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
        onboardingVariant: "standard",
      })

      // Log conversion
      logConversion({ completed: true, stepsViewed: currentStep + 1 })

      toast({
        title: "Onboarding Complete!",
        description: "You're all set to start using Mix & Mingle!",
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

  const currentStepData = onboardingSteps[currentStep]
  const isLastStep = currentStep === onboardingSteps.length - 1

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="flex justify-center items-center mb-4">
          <Image
            src={currentStepData.image || "/placeholder.svg?height=200&width=200&query=onboarding"}
            alt={currentStepData.title}
            width={200}
            height={200}
            className="rounded-lg"
          />
        </div>
        <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
        <p className="text-muted-foreground mb-6">{currentStepData.description}</p>
        <Progress value={progress} className="mb-6" />
        <div className="flex justify-between">
          <div>
            {currentStep > 0 ? (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
            ) : (
              <Button variant="outline" onClick={handleSkip}>
                Skip
              </Button>
            )}
          </div>
          <Button onClick={handleNext} disabled={loading}>
            {isLastStep ? "Get Started" : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
