"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CategoryDistribution } from "@/lib/feedback-analytics-service"
import { Cell, Pie, PieChart, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface CategoryDistributionChartProps {
  data: CategoryDistribution[]
  isLoading?: boolean
}

export function CategoryDistributionChart({ data, isLoading = false }: CategoryDistributionChartProps) {
  // Define colors for categories
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
    "hsl(var(--chart-7))",
    "hsl(var(--chart-8))",
    "hsl(var(--chart-9))",
    "hsl(var(--chart-10))",
  ]

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Categories</CardTitle>
          <CardDescription>Loading category data...</CardDescription>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Categories</CardTitle>
        <CardDescription>Distribution of feedback by category</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer
          config={Object.fromEntries(
            data.map((item, i) => [
              item.category,
              {
                label: item.category,
                color: COLORS[i % COLORS.length],
              },
            ]),
          )}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercentage}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="category"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {dataWithPercentage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
