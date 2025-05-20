"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data - in a real app, this would come from Firebase Analytics
const mockRetentionData = [
  { day: "Day 1", retention: 100 },
  { day: "Day 3", retention: 75 },
  { day: "Day 7", retention: 60 },
  { day: "Day 14", retention: 45 },
  { day: "Day 30", retention: 35 },
  { day: "Day 60", retention: 25 },
  { day: "Day 90", retention: 20 },
]

const mockCohortData = [
  { cohort: "Jan 2023", day1: 100, day7: 65, day30: 40, day90: 25 },
  { cohort: "Feb 2023", day1: 100, day7: 68, day30: 42, day90: 28 },
  { cohort: "Mar 2023", day1: 100, day7: 70, day30: 45, day90: 30 },
  { cohort: "Apr 2023", day1: 100, day7: 72, day30: 48, day90: 32 },
  { cohort: "May 2023", day1: 100, day7: 75, day30: 50, day90: null },
]

const mockChurnReasons = [
  { reason: "Found another app", percentage: 35 },
  { reason: "Too expensive", percentage: 25 },
  { reason: "Not enough users", percentage: 20 },
  { reason: "Technical issues", percentage: 15 },
  { reason: "Other", percentage: 5 },
]

interface RetentionMetricsProps {
  dateRange: { from: Date; to: Date }
}

export function RetentionMetrics({ dateRange }: RetentionMetricsProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [dateRange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Day 7 Retention</CardTitle>
            <CardDescription>Users returning after 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">60%</div>
            <p className="text-sm text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Day 30 Retention</CardTitle>
            <CardDescription>Users returning after 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">35%</div>
            <p className="text-sm text-muted-foreground">+3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Churn Rate</CardTitle>
            <CardDescription>Monthly user churn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8.5%</div>
            <p className="text-sm text-muted-foreground">-1.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="retention" className="space-y-4">
        <TabsList>
          <TabsTrigger value="retention">Retention Curve</TabsTrigger>
          <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="churn">Churn Reasons</TabsTrigger>
        </TabsList>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Retention Curve</CardTitle>
              <CardDescription>Percentage of users retained over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ChartContainer
                config={{
                  retention: {
                    label: "Retention (%)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockRetentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="retention" stroke="var(--color-retention)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohort" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Retention</CardTitle>
              <CardDescription>Retention by user cohort</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ChartContainer
                config={{
                  day7: {
                    label: "Day 7 (%)",
                    color: "hsl(var(--chart-1))",
                  },
                  day30: {
                    label: "Day 30 (%)",
                    color: "hsl(var(--chart-2))",
                  },
                  day90: {
                    label: "Day 90 (%)",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockCohortData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="day7" fill="var(--color-day7)" />
                    <Bar dataKey="day30" fill="var(--color-day30)" />
                    <Bar dataKey="day90" fill="var(--color-day90)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="churn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Churn Reasons</CardTitle>
              <CardDescription>Why users leave the platform</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ChartContainer
                config={{
                  percentage: {
                    label: "Percentage (%)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockChurnReasons} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="reason" type="category" width={150} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="percentage" fill="var(--color-percentage)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
