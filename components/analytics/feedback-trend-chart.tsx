"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FeedbackTrend } from "@/lib/feedback-analytics-service"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface FeedbackTrendChartProps {
  trends: FeedbackTrend[]
  isLoading?: boolean
}

export function FeedbackTrendChart({ trends, isLoading = false }: FeedbackTrendChartProps) {
  const [view, setView] = useState<"total" | "category" | "sentiment">("total")

  // Process data for different views
  const totalTrends = trends.filter((trend) => !trend.category && !trend.sentiment)

  // Get unique categories and sentiments
  const categories = Array.from(new Set(trends.filter((t) => t.category).map((t) => t.category)))
  const sentiments = Array.from(new Set(trends.filter((t) => t.sentiment).map((t) => t.sentiment)))

  // Group data by category
  const categoryTrends = categories.map((category) => {
    return {
      id: category,
      data: trends.filter((t) => t.category === category),
    }
  })

  // Group data by sentiment
  const sentimentTrends = sentiments.map((sentiment) => {
    return {
      id: sentiment,
      data: trends.filter((t) => t.sentiment === sentiment),
    }
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Trends</CardTitle>
          <CardDescription>Loading feedback trend data...</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Trends</CardTitle>
        <CardDescription>Feedback volume over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="total">Total Volume</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="sentiment">By Sentiment</TabsTrigger>
          </TabsList>

          <TabsContent value="total" className="h-80">
            <ChartContainer
              config={{
                count: {
                  label: "Feedback Count",
                  color: "hsl(var(--chart-1))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={totalTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-count)"
                    name="Feedback Count"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="category" className="h-80">
            <ChartContainer
              config={Object.fromEntries(
                categories.map((category, i) => [
                  category!,
                  {
                    label: category!,
                    color: `hsl(var(--chart-${(i % 10) + 1}))`,
                  },
                ]),
              )}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  {categoryTrends.map((categoryData, index) => (
                    <Line
                      key={categoryData.id}
                      type="monotone"
                      data={categoryData.data}
                      dataKey="count"
                      stroke={`var(--color-${categoryData.id})`}
                      name={categoryData.id}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="sentiment" className="h-80">
            <ChartContainer
              config={{
                Positive: {
                  label: "Positive",
                  color: "hsl(var(--chart-3))",
                },
                Neutral: {
                  label: "Neutral",
                  color: "hsl(var(--chart-5))",
                },
                Negative: {
                  label: "Negative",
                  color: "hsl(var(--chart-7))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  {sentimentTrends.map((sentimentData) => (
                    <Line
                      key={sentimentData.id}
                      type="monotone"
                      data={sentimentData.data}
                      dataKey="count"
                      stroke={`var(--color-${sentimentData.id})`}
                      name={sentimentData.id}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
