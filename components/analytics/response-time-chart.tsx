"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ResponseTimeChartProps {
  data: { responseTime: string; count: number }[]
  isLoading?: boolean
}

export function ResponseTimeChart({ data, isLoading = false }: ResponseTimeChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Response Times</CardTitle>
          <CardDescription>Loading response time data...</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  // Define colors for response times
  const COLORS = [
    "hsl(var(--chart-3))", // <1 hour (green)
    "hsl(var(--chart-4))", // 1-4 hours
    "hsl(var(--chart-5))", // 4-24 hours
    "hsl(var(--chart-6))", // 1-3 days
    "hsl(var(--chart-7))", // >3 days (red)
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Response Times</CardTitle>
        <CardDescription>How quickly feedback is being addressed</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer
          config={{
            count: {
              label: "Count",
              color: "hsl(var(--chart-4))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="responseTime" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="count" name="Count">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
