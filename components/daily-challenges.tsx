"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { dailyChallengeService, type DailyChallenge, type UserChallenge } from "@/lib/daily-challenge-service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { TargetIcon, ZapIcon, FlameIcon, ClockIcon } from "lucide-react"
import Link from "next/link"

export function DailyChallenges() {
  const [challenges, setChallenges] = useState<Array<DailyChallenge & { userChallenge?: UserChallenge }>>([])
  const [stats, setStats] = useState<{
    totalCompleted: number
    currentStreak: number
    longestStreak: number
    totalPoints: number
  }>({
    totalCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const loadChallenges = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Get today's challenges
        let dailyChallenges = await dailyChallengeService.getDailyChallenges()

        // If no challenges for today, generate them
        if (dailyChallenges.length === 0) {
          dailyChallenges = await dailyChallengeService.generateDailyChallenges()
        }

        // Get user's challenges
        const userChallenges = await dailyChallengeService.getUserChallenges(user.uid)

        // Combine the data
        const combinedChallenges = dailyChallenges.map((challenge) => {
          const userChallenge = userChallenges.find((uc) => uc.challengeId === challenge.id)
          return {
            ...challenge,
            userChallenge,
          }
        })

        setChallenges(combinedChallenges)

        // Get user stats
        const userStats = await dailyChallengeService.getUserChallengeStats(user.uid)
        setStats(userStats)
      } catch (error) {
        console.error("Error loading challenges:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load daily challenges. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [user, toast, refreshKey])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-500"
      case "medium":
        return "bg-yellow-500/10 text-yellow-500"
      case "hard":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-primary/10 text-primary"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "feedback":
        return <MessageSquareIcon className="h-4 w-4" />
      case "testing":
        return <BugIcon className="h-4 w-4" />
      case "social":
        return <UsersIcon className="h-4 w-4" />
      case "exploration":
        return <CompassIcon className="h-4 w-4" />
      case "engagement":
        return <HeartIcon className="h-4 w-4" />
      case "technical":
        return <SettingsIcon className="h-4 w-4" />
      default:
        return <TargetIcon className="h-4 w-4" />
    }
  }

  const getTimeRemaining = () => {
    const now = new Date()
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    const diffMs = endOfDay.getTime() - now.getTime()

    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Challenges</CardTitle>
          <CardDescription>Complete challenges to earn points and rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between mb-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Daily Challenges</CardTitle>
            <CardDescription>Complete challenges to earn points and rewards</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="flex items-center gap-1"
          >
            <RefreshCwIcon className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary mb-1">{stats.totalCompleted}</div>
            <div className="text-xs text-muted-foreground">Challenges Completed</div>
          </div>

          <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-1">
              <FlameIcon className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold text-primary">{stats.currentStreak}</span>
            </div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>

          <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary mb-1">{stats.totalPoints}</div>
            <div className="text-xs text-muted-foreground">Total Points Earned</div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-medium">Today's Challenges</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            Resets in {getTimeRemaining()}
          </div>
        </div>

        <div className="space-y-4">
          {challenges.length > 0 ? (
            challenges.map((challenge) => {
              const requirement = challenge.requirements[0] // For simplicity, we're using the first requirement
              const progress = challenge.userChallenge?.progress || 0
              const isCompleted = challenge.userChallenge?.status === "completed"
              const progressPercentage = Math.min(100, (progress / requirement.count) * 100)

              return (
                <div
                  key={challenge.id}
                  className={`p-4 border rounded-lg ${isCompleted ? "bg-primary/5 border-primary/20" : "bg-card"}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${isCompleted ? "bg-primary/10" : "bg-muted"}`}>
                        {isCompleted ? (
                          <CheckIcon className="h-4 w-4 text-primary" />
                        ) : (
                          getCategoryIcon(challenge.category)
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{challenge.title}</h4>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>{challenge.difficulty}</Badge>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>
                        Progress: {progress}/{requirement.count}
                      </span>
                      <span className="flex items-center gap-1">
                        <ZapIcon className="h-3 w-3 text-primary" />
                        {challenge.reward.points} points
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  {isCompleted && (
                    <div className="mt-3 text-xs text-primary flex items-center gap-1">
                      <CheckCircleIcon className="h-3 w-3" />
                      Completed! You earned {challenge.userChallenge?.reward?.points || challenge.reward.points} points
                      {challenge.userChallenge?.reward?.streakBonus
                        ? ` (includes ${challenge.userChallenge.reward.streakBonus} streak bonus)`
                        : ""}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-6">
              <TargetIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No challenges available today.</p>
              <p className="text-sm text-muted-foreground mt-1">Check back tomorrow for new challenges!</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard/beta/challenges/history">View History</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/beta/challenges/leaderboard">Challenge Leaderboard</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

// Import these icons
import {
  MessageSquareIcon,
  BugIcon,
  UsersIcon,
  CompassIcon,
  HeartIcon,
  SettingsIcon,
  CheckIcon,
  CheckCircleIcon,
  RefreshCwIcon,
} from "lucide-react"
