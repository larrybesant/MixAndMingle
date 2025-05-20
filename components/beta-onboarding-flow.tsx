"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-client"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { ArrowRight, ArrowLeft } from "lucide-react"

const onboardingSteps = [
  {
    title: "Welcome to Mix & Mingle Beta!",
    description:
      "You're now part of an exclusive group helping us shape the future of social networking. Let's get you set up!",
    image: "/placeholder.svg?key=drkvn",
  },
  {
    title: "Complete Your Profile",
    description: "Add a profile picture and some details about yourself to get the most out of your beta experience.",
    image: "/placeholder.svg?key=mthgj",
  },
  {
    title: "Beta Tester Perks",
    description:
      "As a beta tester, you'll earn exclusive badges, get early access to features, and have direct input on our roadmap.",
    image: "/placeholder.svg?key=esjcc",
  },
  {
    title: "Daily Challenges",
    description:
      "Complete daily challenges to earn points, unlock badges, and help us test specific features of the platform.",
    image: "/daily-challenges-gamification.png",
  },
  {
    title: "Provide Feedback",
    description:
      "Your feedback is crucial! Use the feedback button in the app to report bugs, suggest improvements, or share ideas.",
    image: "/placeholder-4o24u.png",
  },
  {
    title: "You're All Set!",
    description:
      "You're ready to start exploring Mix & Mingle. Remember, this is a beta version, so things might change as we improve.",
    image: "/celebration-confetti.png",
  },
]

export function BetaOnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Calculate progress percentage
    setProgress(((currentStep + 1) / onboardingSteps.length) * 100)
  }, [currentStep])

  useEffect(() => {
    // Check if user has already completed onboarding
    const checkOnboardingStatus = async () => {
      if (!user) return

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))

        if (userDoc.exists() && userDoc.data().betaOnboardingCompleted) {
          // User has already completed onboarding, redirect to dashboard
          router.push("/dashboard/beta")
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error)
      }
    }

    checkOnboardingStatus()
  }, [user, router])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

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
        betaOnboardingCompleted: true,
        betaOnboardingCompletedAt: serverTimestamp(),
      })

      // Award first badge if it doesn\'t exist yet
      const badgesRef = doc(db, "userBadges", user.uid)
      const badgesDoc = await getDoc(badgesRef)

      if (!badgesDoc.exists()) {
        await setDoc(badgesRef, {
          badges: ["beta_onboarding"],
          updatedAt: serverTimestamp(),
        })
      } else if (!badgesDoc.data().badges.includes("beta_onboarding")) {
        await updateDoc(badgesRef, {
          badges: [...badgesDoc.data().badges, "beta_onboarding"],
          updatedAt: serverTimestamp(),
        })
      }

      toast({
        title: "Onboarding Complete!",
        description: "You've earned the Beta Tester badge!",
      })

      // Redirect to beta dashboard
      router.push("/dashboard/beta")
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
    <div className="min-h-screen">
      <Card>
        <CardContent>
          <div className="flex justify-center items-center mb-4">
            <Image
              src={currentStepData.image || "/placeholder.svg"}
              alt={currentStepData.title}
              width={200}
              height={200}
            />
          </div>
          <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
          <p className="text-gray-600 mb-6">{currentStepData.description}</p>
          <Progress value={progress} className="mb-6" />
          <div className="flex justify-between">
            <Button onClick={handlePrevious} disabled={currentStep === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button onClick={isLastStep ? handleComplete : handleNext} loading={loading}>
              {isLastStep ? "Complete" : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
