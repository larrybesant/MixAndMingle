"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import dynamic from "next/dynamic"

// Dynamically import heavy components
const HeavyChart = dynamic(() => import("@/components/analytics/beta-engagement-chart"), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false, // Disable server-side rendering for this component
})

const HeavyDataGrid = dynamic(() => import("@/components/analytics/beta-user-activity-table"), {
  loading: () => <Skeleton className="h-[400px] w-full" />,
  ssr: false,
})

export function DynamicImportExample() {
  const [showChart, setShowChart] = useState(false)
  const [showGrid, setShowGrid] = useState(false)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bundle Optimization Demo</CardTitle>
        <CardDescription>Components are loaded only when needed, reducing initial bundle size</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button onClick={() => setShowChart(!showChart)}>{showChart ? "Hide" : "Show"} Engagement Chart</Button>

          {showChart && <HeavyChart />}
        </div>

        <div className="space-y-2">
          <Button onClick={() => setShowGrid(!showGrid)}>{showGrid ? "Hide" : "Show"} User Activity Table</Button>

          {showGrid && <HeavyDataGrid />}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        These components are loaded dynamically only when the user requests them
      </CardFooter>
    </Card>
  )
}
