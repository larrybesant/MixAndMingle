"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CheckCircleIcon, ClockIcon, CalendarIcon } from "lucide-react"

interface UserBetaAnalyticsProps {
  className?: string
}

export function UserBetaAnalytics({ className }: UserBetaAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    tasksCompleted: 0,
    totalTasks: 10,
    feedbackSubmitted: 0,
    lastActive: new Date(),
    sessionCount: 0,
    totalTimeSpent: 0, // in minutes
    activityByDay: [0, 0, 0, 0, 0, 0, 0], // last 7 days
  })

  const { user } = useAuth()

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        // In a real implementation, you would fetch this data from Firestore
        // For this example, we'll use sample data

        // Simulate fetching user data
        const userData = {
          tasksCompleted: 6,
          totalTasks: 10,
          feedbackSubmitted: 8,
          lastActive: new Date(),
          sessionCount: 24,
          totalTimeSpent: 320, // in minutes
          activityByDay: [30, 45, 20, 60, 40, 75, 50], // last 7 days
        }

        setUserStats(userData)
      } catch (error) {
        console.error("Error fetching user analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAnalytics()
  }, [user])

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getDayLabels = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toLocaleDateString("en-US", { weekday: "short" }))
    }
    return days
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-4">Your Beta Progress</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Task Completion</CardTitle>
            <CardDescription>Your progress through beta tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">
                {userStats.tasksCompleted}/{userStats.totalTasks} tasks
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.round((userStats.tasksCompleted / userStats.totalTasks) * 100)}% complete
              </div>
            </div>
            <Progress value={(userStats.tasksCompleted / userStats.totalTasks) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Feedback Submitted</CardTitle>
            <CardDescription>Your contributions to improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-primary mr-4">{userStats.feedbackSubmitted}</div>
              <div className="text-sm text-muted-foreground">Thank you for helping us improve Mix & Mingle!</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Activity</CardTitle>
          <CardDescription>Stats about your beta testing activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Daily Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-primary mr-2" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total Time Spent</div>
                    <div className="font-medium">{formatTimeSpent(userStats.totalTimeSpent)}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-primary mr-2" />
                  <div>
                    <div className="text-sm text-muted-foreground">Sessions</div>
                    <div className="font-medium">{userStats.sessionCount} sessions</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-primary mr-2" />
                  <div>
                    <div className="text-sm text-muted-foreground">Completion Rate</div>
                    <div className="font-medium">
                      {Math.round((userStats.tasksCompleted / userStats.totalTasks) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="h-40 flex items-end space-x-2">
                {userStats.activityByDay.map((activity, index) => {
                  const height = `${(activity / Math.max(...userStats.activityByDay)) * 100}%`
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="flex-1 w-full flex items-end">
                        <div className="w-full bg-primary/80 rounded-t" style={{ height }}></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">{getDayLabels()[index]}</div>
                    </div>
                  )
                })}
              </div>
              <div className="text-xs text-center text-muted-foreground mt-4">Your activity over the past 7 days</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
