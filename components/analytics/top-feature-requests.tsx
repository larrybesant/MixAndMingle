"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface TopFeatureRequestsProps {
  data: { feature: string; count: number }[]
  isLoading?: boolean
}

export function TopFeatureRequests({ data, isLoading = false }: TopFeatureRequestsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Feature Requests</CardTitle>
          <CardDescription>Loading feature request data...</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  // Sort data by count in descending order
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Feature Requests</CardTitle>
        <CardDescription>Most requested features from beta testers</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer
          config={{
            count: {
              label: "Request Count",
              color: "hsl(var(--chart-2))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="feature"
                width={90}
                tickFormatter={(value) => {
                  return value.length > 15 ? value.substring(0, 15) + "..." : value
                }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="count" name="Request Count" fill="var(--color-count)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
