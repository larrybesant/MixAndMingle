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
import { Badge } from "@/components/ui/badge"
import { Confetti } from "@/components/ui/confetti"
import { ArrowRight, Star, Trophy, Award } from "lucide-react"
import { useABTestEvent } from "@/hooks/use-ab-test-event"

interface OnboardingTask {
  id: string
  title: string
  description: string
  image: string
  points: number
  completed: boolean
}

export function GamifiedOnboarding() {
  const [tasks, setTasks] = useState<OnboardingTask[]>([
    {
      id: "welcome",
      title: "Welcome to Mix & Mingle",
      description: "Start your journey to connect with friends and join exciting conversations.",
      image: "/onboarding-welcome.png",
      points: 10,
      completed: false,
    },
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Add a profile picture and some details about yourself.",
      image: "/onboarding-profile.png",
      points: 15,
      completed: false,
    },
    {
      id: "discover",
      title: "Discover DJ Rooms",
      description: "Learn about live DJ sets and music-focused chat rooms.",
      image: "/onboarding-dj.png",
      points: 20,
      completed: false,
    },
    {
      id: "premium",
      title: "Explore Premium Features",
      description: "See what Premium and VIP memberships offer.",
      image: "/onboarding-premium.png",
      points: 25,
      completed: false,
    },
  ])

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { logEvent, logConversion } = useABTestEvent("onboarding-experience", "gamified")

  useEffect(() => {
    // Log impression when component mounts
    logEvent("view")
  }, [logEvent])

  const completeCurrentTask = () => {
    const updatedTasks = [...tasks]
    const currentTask = updatedTasks[currentTaskIndex]

    if (!currentTask.completed) {
      currentTask.completed = true
      setTasks(updatedTasks)
      setTotalPoints(totalPoints + currentTask.points)

      // Log task completion
      logEvent("task_completed", {
        taskId: currentTask.id,
        taskIndex: currentTaskIndex,
        points: currentTask.points,
      })

      // Show confetti animation
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)

      // Show toast
      toast({
        title: `+${currentTask.points} points!`,
        description: `You completed: ${currentTask.title}`,
      })
    }

    // Move to next task if available
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1)
    }
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
        onboardingVariant: "gamified",
        onboardingPoints: totalPoints,
      })

      // Log conversion
      logConversion({
        completed: true,
        points: totalPoints,
        tasksCompleted: tasks.filter((t) => t.completed).length,
      })

      // Show confetti
      setShowConfetti(true)

      toast({
        title: "Onboarding Complete!",
        description: `You earned ${totalPoints} points! Keep exploring to earn more.`,
      })

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
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

  const currentTask = tasks[currentTaskIndex]
  const progress = (tasks.filter((t) => t.completed).length / tasks.length) * 100
  const allTasksCompleted = tasks.every((t) => t.completed)

  return (
    <>
      {showConfetti && <Confetti />}

      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Get Started</h2>
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3" /> {totalPoints} points
            </Badge>
          </div>

          <Progress value={progress} className="mb-6" />

          <div className="flex justify-center items-center mb-4">
            <Image
              src={currentTask.image || "/placeholder.svg?height=200&width=200&query=onboarding"}
              alt={currentTask.title}
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">{currentTask.title}</h3>
              <Badge variant="secondary">+{currentTask.points} pts</Badge>
            </div>
            <p className="text-muted-foreground mt-2">{currentTask.description}</p>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">{Math.floor(progress)}% complete</span>
            </div>

            {allTasksCompleted ? (
              <Button onClick={completeOnboarding} disabled={loading}>
                Finish <Award className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={completeCurrentTask} disabled={currentTask.completed}>
                {currentTask.completed ? "Completed" : "Complete Task"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {!allTasksCompleted && (
            <div className="mt-4 text-center">
              <Button variant="link" onClick={completeOnboarding}>
                Skip tutorial
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
