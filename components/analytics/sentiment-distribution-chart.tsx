"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SentimentDistribution } from "@/lib/feedback-analytics-service"
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface SentimentDistributionChartProps {
  data: SentimentDistribution[]
  averageSentiment: number
  isLoading?: boolean
}

export function SentimentDistributionChart({
  data,
  averageSentiment,
  isLoading = false,
}: SentimentDistributionChartProps) {
  // Define colors for sentiment
  const SENTIMENT_COLORS = {
    Positive: "hsl(var(--chart-3))",
    Neutral: "hsl(var(--chart-5))",
    Negative: "hsl(var(--chart-7))",
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Sentiment</CardTitle>
          <CardDescription>Loading sentiment data...</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  // Calculate percentages
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const dataWithPercentage = data.map((item) => ({
    ...item,
    percentage: ((item.count / total) * 100).toFixed(1),
  }))

  // Get sentiment score label
  const getSentimentLabel = (score: number) => {
    if (score < -0.3) return "Negative"
    if (score > 0.3) return "Positive"
    return "Neutral"
  }

  const sentimentLabel = getSentimentLabel(averageSentiment)
  const sentimentColor = SENTIMENT_COLORS[sentimentLabel as keyof typeof SENTIMENT_COLORS]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Sentiment</CardTitle>
        <CardDescription>
          Average sentiment:{" "}
          <span className="font-medium" style={{ color: sentimentColor }}>
            {sentimentLabel}
          </span>{" "}
          ({averageSentiment.toFixed(2)})
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer
          config={{
            Positive: {
              label: "Positive",
              color: SENTIMENT_COLORS.Positive,
            },
            Neutral: {
              label: "Neutral",
              color: SENTIMENT_COLORS.Neutral,
            },
            Negative: {
              label: "Negative",
              color: SENTIMENT_COLORS.Negative,
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataWithPercentage}>
              <XAxis dataKey="sentiment" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="count" nameKey="sentiment">
                {dataWithPercentage.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={SENTIMENT_COLORS[entry.sentiment as keyof typeof SENTIMENT_COLORS]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
