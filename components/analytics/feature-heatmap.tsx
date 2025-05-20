"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FeatureHeatmapItem } from "@/lib/feedback-analytics-service"
import { Cell, Tooltip, ResponsiveContainer, Treemap } from "recharts"

interface FeatureHeatmapProps {
  data: FeatureHeatmapItem[]
  isLoading?: boolean
}

export function FeatureHeatmap({ data, isLoading = false }: FeatureHeatmapProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Feedback Heatmap</CardTitle>
          <CardDescription>Loading feature data...</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  // Process data for treemap
  const processedData = data.reduce((result: any[], item) => {
    // Find existing feature
    const existingFeature = result.find((f) => f.name === item.feature)

    if (existingFeature) {
      // Add category to existing feature
      existingFeature.children.push({
        name: item.category,
        size: item.count,
        value: item.count,
      })
    } else {
      // Create new feature
      result.push({
        name: item.feature,
        children: [
          {
            name: item.category,
            size: item.count,
            value: item.count,
          },
        ],
      })
    }

    return result
  }, [])

  // Prepare data for treemap
  const treemapData = {
    name: "Features",
    children: processedData,
  }

  // Define color scale
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

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{data.name}</p>
          <p>Feature: {data.root?.name || "N/A"}</p>
          <p>Count: {data.value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Feedback Heatmap</CardTitle>
        <CardDescription>Distribution of feedback across features and categories</CardDescription>
      </CardHeader>
      <CardContent className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap data={treemapData} dataKey="size" ratio={4 / 3} stroke="#fff" animationDuration={500}>
            <Tooltip content={<CustomTooltip />} />
            {processedData.map((entry, index) =>
              entry.children.map((child: any, childIndex: number) => (
                <Cell
                  key={`cell-${index}-${childIndex}`}
                  fill={COLORS[index % COLORS.length]}
                  opacity={0.7 + childIndex * 0.1}
                />
              )),
            )}
          </Treemap>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
