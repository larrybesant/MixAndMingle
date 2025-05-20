"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DateRange } from "react-day-picker"
import { format, eachDayOfInterval } from "date-fns"

// This would normally be imported from a charting library like recharts
// For this example, we'll create a simplified version
function LineChart({ data, xKey, yKey, height = 300 }: { data: any[]; xKey: string; yKey: string; height?: number }) {
  // In a real implementation, this would render an actual chart
  // For now, we'll just display the data in a simplified visual format

  const maxValue = Math.max(...data.map((item) => item[yKey])) || 1

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="flex h-full items-end space-x-2">
        {data.map((item, index) => {
          const height = (item[yKey] / maxValue) * 100
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-primary/80 rounded-t"
                style={{ height: `${Math.max(height, 4)}%` }}
                title={`${item[xKey]}: ${item[yKey]}`}
              ></div>
              {index % 7 === 0 && (
                <div className="text-xs text-muted-foreground mt-2 rotate-45 origin-left">
                  {typeof item[xKey] === "string" ? item[xKey] : format(item[xKey], "MMM d")}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex justify-between text-xs text-muted-foreground">
        <div>0</div>
        <div>{maxValue}</div>
      </div>
    </div>
  )
}

interface BetaEngagementChartProps {
  dateRange: DateRange
}

export function BetaEngagementChart({ dateRange }: BetaEngagementChartProps) {
  const [dailyActiveUsers, setDailyActiveUsers] = useState<any[]>([])
  const [avgSessionDuration, setAvgSessionDuration] = useState<any[]>([])
  const [actionsPerSession, setActionsPerSession] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEngagementData = async () => {
      if (!dateRange.from || !dateRange.to) return

      setIsLoading(true)

      try {
        // In a real implementation, you would fetch this data from Firestore
        // For this example, we'll generate sample data

        const days = eachDayOfInterval({
          start: dateRange.from,
          end: dateRange.to,
        })

        // Generate sample data for each day
        const dau: any[] = []
        const sessionDuration: any[] = []
        const actions: any[] = []

        days.forEach((day) => {
          // Generate some random but somewhat realistic data
          const dayOfWeek = day.getDay()
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

          // More users on weekends, random variation
          const baseUsers = isWeekend ? 120 : 80
          const userVariation = Math.floor(Math.random() * 40) - 20
          const users = Math.max(10, baseUsers + userVariation)

          // Longer sessions on weekends
          const baseDuration = isWeekend ? 18 : 12
          const durationVariation = Math.floor(Math.random() * 6) - 3
          const duration = Math.max(5, baseDuration + durationVariation)

          // More actions on weekends
          const baseActions = isWeekend ? 25 : 18
          const actionVariation = Math.floor(Math.random() * 10) - 5
          const actionCount = Math.max(5, baseActions + actionVariation)

          dau.push({ date: day, count: users })
          sessionDuration.push({ date: day, minutes: duration })
          actions.push({ date: day, count: actionCount })
        })

        setDailyActiveUsers(dau)
        setAvgSessionDuration(sessionDuration)
        setActionsPerSession(actions)
      } catch (error) {
        console.error("Error fetching engagement data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEngagementData()
  }, [dateRange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="dau">
      <TabsList>
        <TabsTrigger value="dau">Daily Active Users</TabsTrigger>
        <TabsTrigger value="session">Avg. Session Duration</TabsTrigger>
        <TabsTrigger value="actions">Actions Per Session</TabsTrigger>
      </TabsList>

      <TabsContent value="dau" className="pt-4">
        <LineChart data={dailyActiveUsers} xKey="date" yKey="count" height={300} />
        <div className="mt-4 text-sm text-center text-muted-foreground">
          Daily active users over the selected time period
        </div>
      </TabsContent>

      <TabsContent value="session" className="pt-4">
        <LineChart data={avgSessionDuration} xKey="date" yKey="minutes" height={300} />
        <div className="mt-4 text-sm text-center text-muted-foreground">Average session duration in minutes</div>
      </TabsContent>

      <TabsContent value="actions" className="pt-4">
        <LineChart data={actionsPerSession} xKey="date" yKey="count" height={300} />
        <div className="mt-4 text-sm text-center text-muted-foreground">Average number of actions per session</div>
      </TabsContent>
    </Tabs>
  )
}
