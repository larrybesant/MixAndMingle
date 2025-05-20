"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface OnboardingStep {
  title: string
  description: string
  image?: string
}

const onboardingSteps: OnboardingStep[] = [
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

export function OnboardingFlow() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true)

  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Check if user has completed onboarding
  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!user) return

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setHasCompletedOnboarding(userData.hasCompletedOnboarding === true)

          if (!userData.hasCompletedOnboarding) {
            setOpen(true)
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error)
      }
    }

    checkOnboardingStatus()
  }, [user])

  // Handle next step
  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Complete onboarding
  const completeOnboarding = async () => {
    if (!user) return

    try {
      await updateDoc(doc(db, "users", user.uid), {
        hasCompletedOnboarding: true,
      })

      setHasCompletedOnboarding(true)
      setOpen(false)

      toast({
        title: "Onboarding complete",
        description: "You're all set to start using Mix & Mingle!",
      })
    } catch (error) {
      console.error("Error completing onboarding:", error)
    }
  }

  // Skip onboarding
  const skipOnboarding = async () => {
    await completeOnboarding()
  }

  if (hasCompletedOnboarding) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{onboardingSteps[currentStep].title}</DialogTitle>
          <DialogDescription>{onboardingSteps[currentStep].description}</DialogDescription>
        </DialogHeader>

        {onboardingSteps[currentStep].image && (
          <div className="flex justify-center py-4">
            <img
              src={onboardingSteps[currentStep].image || "/placeholder.svg"}
              alt={onboardingSteps[currentStep].title}
              className="rounded-lg max-h-60 object-cover"
            />
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" onClick={skipOnboarding}>
              Skip
            </Button>

            <div className="flex items-center space-x-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}

              <Button onClick={handleNext}>{currentStep < onboardingSteps.length - 1 ? "Next" : "Get Started"}</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
