"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import type { UserChallenge, DailyChallenge } from "@/lib/daily-challenge-service"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeftIcon, CalendarIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "lucide-react"
import Link from "next/link"

export default function ChallengeHistoryPage() {
  const [history, setHistory] = useState<
    Array<{ date: string; challenges: Array<UserChallenge & { details?: DailyChallenge }> }>
  >([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return

      setLoading(true)
      try {
        // This is a placeholder - you would need to implement this method in the service
        // const userChallengeHistory = await dailyChallengeService.getUserChallengeHistory(user.uid)

        // For now, we'll use mock data
        const mockHistory = [
          {
            date: new Date().toISOString().split("T")[0], // Today
            challenges: [
              {
                challengeId: "challenge1",
                date: new Date().toISOString().split("T")[0],
                status: "completed",
                progress: 5,
                completedAt: { toDate: () => new Date() },
                reward: { points: 20, streakBonus: 2 },
                details: {
                  id: "challenge1",
                  title: "Social Butterfly",
                  description: "Connect with 5 other beta testers",
                  category: "social",
                  icon: "users",
                  requirements: [{ type: "connect", count: 5 }],
                  reward: { points: 20 },
                  difficulty: "medium",
                  isActive: true,
                  date: new Date().toISOString().split("T")[0],
                  expiresAt: { toDate: () => new Date() },
                },
              },
              {
                challengeId: "challenge2",
                date: new Date().toISOString().split("T")[0],
                status: "active",
                progress: 2,
                details: {
                  id: "challenge2",
                  title: "Feedback Frenzy",
                  description: "Submit 3 pieces of feedback",
                  category: "feedback",
                  icon: "message-square",
                  requirements: [{ type: "feedback", count: 3 }],
                  reward: { points: 15 },
                  difficulty: "easy",
                  isActive: true,
                  date: new Date().toISOString().split("T")[0],
                  expiresAt: { toDate: () => new Date() },
                },
              },
            ],
          },
          {
            date: new Date(Date.now() - 86400000).toISOString().split("T")[0], // Yesterday
            challenges: [
              {
                challengeId: "challenge3",
                date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
                status: "completed",
                progress: 1,
                completedAt: { toDate: () => new Date(Date.now() - 86400000) },
                reward: { points: 25, streakBonus: 0 },
                details: {
                  id: "challenge3",
                  title: "Video Pioneer",
                  description: "Join a video room and stay for 5 minutes",
                  category: "testing",
                  icon: "video",
                  requirements: [{ type: "video", count: 1 }],
                  reward: { points: 25 },
                  difficulty: "medium",
                  isActive: true,
                  date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
                  expiresAt: { toDate: () => new Date(Date.now() - 86400000) },
                },
              },
              {
                challengeId: "challenge4",
                date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
                status: "expired",
                progress: 0,
                details: {
                  id: "challenge4",
                  title: "Bug Hunter",
                  description: "Report a bug with detailed steps to reproduce",
                  category: "feedback",
                  icon: "bug",
                  requirements: [{ type: "bug", count: 1 }],
                  reward: { points: 30 },
                  difficulty: "hard",
                  isActive: true,
                  date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
                  expiresAt: { toDate: () => new Date(Date.now() - 86400000) },
                },
              },
            ],
          },
        ]

        setHistory(mockHistory)
      } catch (error) {
        console.error("Error loading challenge history:", error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [user])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case "expired":
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case "active":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-40" />
        </div>

        <Skeleton className="h-6 w-full mb-8" />

        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-4">
                {[1, 2].map((j) => (
                  <Skeleton key={j} className="h-24 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/beta/challenges">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Challenge History</h1>
      </div>

      <p className="text-muted-foreground mb-8">View your past challenges and track your progress over time</p>

      {history.length > 0 ? (
        <div className="space-y-8">
          {history.map((day) => (
            <div key={day.date} className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">{formatDate(day.date)}</h2>
              </div>

              <div className="space-y-4">
                {day.challenges.map((challenge) => (
                  <Card key={challenge.challengeId}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getStatusIcon(challenge.status)}</div>
                          <div>
                            <h3 className="font-medium">{challenge.details?.title || challenge.challengeId}</h3>
                            <p className="text-sm text-muted-foreground">{challenge.details?.description}</p>

                            {challenge.status === "completed" && (
                              <div className="mt-2 text-sm text-green-500">
                                Completed! You earned {challenge.reward?.points || 0} points
                                {challenge.reward?.streakBonus
                                  ? ` (includes ${challenge.reward.streakBonus} streak bonus)`
                                  : ""}
                              </div>
                            )}

                            {challenge.status === "active" && (
                              <div className="mt-2 text-sm text-yellow-500">
                                In progress: {challenge.progress}/{challenge.details?.requirements[0].count || 0}{" "}
                                completed
                              </div>
                            )}

                            {challenge.status === "expired" && (
                              <div className="mt-2 text-sm text-red-500">Expired: Challenge not completed in time</div>
                            )}
                          </div>
                        </div>

                        {challenge.details && (
                          <Badge className={getDifficultyColor(challenge.details.difficulty)}>
                            {challenge.details.difficulty}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No challenge history available yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start completing daily challenges to build your history!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
