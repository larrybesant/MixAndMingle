"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useFirebase } from "@/hooks/use-firebase"
import { captureError, trackBetaEvent } from "@/lib/sentry"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BetaTaskList } from "@/components/beta-task-list"
import { BugReportForm } from "@/components/beta/bug-report-form"
import { FeedbackForm } from "@/components/beta/feedback-form"
import { BetaLeaderboard } from "@/components/beta-leaderboard"
import { UserBadges } from "@/components/user-badges"
import { InAppFeedbackWidget } from "@/components/beta/in-app-feedback-widget"
import {
  BeakerIcon,
  BugIcon,
  MessageSquareIcon,
  TrophyIcon,
  CheckCircleIcon,
  ClipboardListIcon,
  StarIcon,
  BellIcon,
} from "lucide-react"

interface BetaUser {
  id: string
  displayName: string
  email: string
  photoURL?: string
  betaStatus: "active" | "inactive" | "completed"
  betaJoinDate: any
  tasksCompleted: number
  totalTasks: number
  points: number
  rank?: number
  badges: string[]
  feedbackCount: number
  bugReportsCount: number
}

export function BetaUserDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const { getDocument, updateDocument } = useFirebase()
  const [betaUser, setBetaUser] = useState<BetaUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Load beta user data
  useEffect(() => {
    const loadBetaUser = async () => {
      if (!user) {
        router.push("/login?redirect=/dashboard/beta")
        return
      }

      try {
        setLoading(true)
        const userData = await getDocument("betaUsers", user.uid)

        if (!userData) {
          // User is not a beta tester, redirect to beta application
          router.push("/beta/apply")
          return
        }

        setBetaUser(userData as BetaUser)
        trackBetaEvent("beta_dashboard_viewed", { userId: user.uid })
      } catch (error) {
        console.error("Error loading beta user data:", error)
        captureError(error instanceof Error ? error : new Error("Failed to load beta user data"))
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadBetaUser()
    }
  }, [user, getDocument, router])

  // Track tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    trackBetaEvent("beta_dashboard_tab_changed", { tab: value })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="mt-4 text-lg">Loading your beta dashboard...</p>
        </div>
      </div>
    )
  }

  if (!betaUser) {
    return null // Handled by the redirect in useEffect
  }

  const completionPercentage =
    betaUser.totalTasks > 0 ? Math.round((betaUser.tasksCompleted / betaUser.totalTasks) * 100) : 0

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <BeakerIcon className="mr-2 h-6 w-6 text-primary" />
            Beta Tester Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Help shape the future of Mix & Mingle by completing tasks and providing feedback
          </p>
        </div>
        <Badge variant="outline" className="mt-2 md:mt-0 px-3 py-1 text-sm bg-primary/10">
          Beta Tester
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Progress</CardTitle>
            <CardDescription>Your beta testing progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {betaUser.tasksCompleted} of {betaUser.totalTasks} tasks completed
                </span>
                <span className="font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Contributions</CardTitle>
            <CardDescription>Your feedback and bug reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center p-3 bg-primary/5 rounded-md">
                <MessageSquareIcon className="h-6 w-6 text-primary mb-1" />
                <span className="text-2xl font-bold">{betaUser.feedbackCount}</span>
                <span className="text-xs text-muted-foreground">Feedback</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-red-500/5 rounded-md">
                <BugIcon className="h-6 w-6 text-red-500 mb-1" />
                <span className="text-2xl font-bold">{betaUser.bugReportsCount}</span>
                <span className="text-xs text-muted-foreground">Bug Reports</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rewards</CardTitle>
            <CardDescription>Your points and ranking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center p-3 bg-yellow-500/5 rounded-md">
                <StarIcon className="h-6 w-6 text-yellow-500 mb-1" />
                <span className="text-2xl font-bold">{betaUser.points}</span>
                <span className="text-xs text-muted-foreground">Points</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-primary/5 rounded-md">
                <TrophyIcon className="h-6 w-6 text-primary mb-1" />
                <span className="text-2xl font-bold">#{betaUser.rank || "—"}</span>
                <span className="text-xs text-muted-foreground">Rank</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <ClipboardListIcon className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="report-bug">
            <BugIcon className="h-4 w-4 mr-2" />
            Report Bug
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquareIcon className="h-4 w-4 mr-2" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="badges">
            <TrophyIcon className="h-4 w-4 mr-2" />
            Badges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to the Mix & Mingle Beta Program!</CardTitle>
              <CardDescription>
                Thank you for joining our beta testing program. Your feedback is invaluable in helping us create the
                best possible experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                As a beta tester, you'll have early access to new features, the ability to provide direct feedback to
                our development team, and earn exclusive rewards.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium flex items-center mb-2">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                    How to Participate
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2">1.</span>
                      <span>Complete the tasks in the Tasks tab</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2.</span>
                      <span>Report any bugs you encounter</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3.</span>
                      <span>Provide feedback on features</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">4.</span>
                      <span>Earn badges and climb the leaderboard</span>
                    </li>
                  </ul>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium flex items-center mb-2">
                    <BellIcon className="h-5 w-5 mr-2 text-blue-500" />
                    What's New
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Enhanced video rooms with DJ features</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>New virtual gift system</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Improved chat experience with reactions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Profile customization options</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setActiveTab("tasks")}>View Your Tasks</Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Badges</CardTitle>
                <CardDescription>Badges you've earned as a beta tester</CardDescription>
              </CardHeader>
              <CardContent>
                <UserBadges userId={user?.uid} limit={4} />
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => setActiveTab("badges")}>
                  View All Badges
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Top beta testers this week</CardDescription>
              </CardHeader>
              <CardContent>
                <BetaLeaderboard limit={5} />
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => router.push("/dashboard/beta/badges/leaderboard")}>
                  View Full Leaderboard
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Beta Testing Tasks</CardTitle>
              <CardDescription>Complete these tasks to help us improve Mix & Mingle</CardDescription>
            </CardHeader>
            <CardContent>
              <BetaTaskList userId={user?.uid} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report-bug">
          <BugReportForm />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackForm />
        </TabsContent>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Your Beta Tester Badges</CardTitle>
              <CardDescription>Badges you've earned through your beta testing activities</CardDescription>
            </CardHeader>
            <CardContent>
              <UserBadges userId={user?.uid} showAll />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating feedback button */}
      <InAppFeedbackWidget />
    </div>
  )
}
