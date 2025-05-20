"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FunnelStep {
  name: string
  count: number
  percentage: number
  color: string
}

export function BetaFunnelChart() {
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([
    { name: "Applications", count: 250, percentage: 100, color: "#8b5cf6" },
    { name: "Approved", count: 180, percentage: 72, color: "#6366f1" },
    { name: "Onboarded", count: 150, percentage: 60, color: "#3b82f6" },
    { name: "Active", count: 120, percentage: 48, color: "#0ea5e9" },
    { name: "Completed 50%+ Tasks", count: 85, percentage: 34, color: "#06b6d4" },
    { name: "Submitted Feedback", count: 65, percentage: 26, color: "#14b8a6" },
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Beta Tester Funnel</CardTitle>
        <CardDescription>Conversion through the beta testing process</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnelData.map((step, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{step.name}</span>
                <span className="font-medium">
                  {step.count} ({step.percentage}%)
                </span>
              </div>
              <div className="w-full h-8 bg-muted rounded-md overflow-hidden flex items-center">
                <div
                  className="h-full rounded-md flex items-center justify-end pr-2 text-white text-xs font-medium"
                  style={{
                    width: `${step.percentage}%`,
                    backgroundColor: step.color,
                  }}
                >
                  {step.percentage >= 15 ? `${step.percentage}%` : ""}
                </div>
              </div>
              {index < funnelData.length - 1 && (
                <div className="flex justify-center">
                  <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-muted-foreground/20"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-sm text-muted-foreground">
          <p>
            The funnel shows a 72% approval rate for beta applications, with 48% of applicants becoming active testers.
            26% of all applicants have submitted feedback, representing a strong engagement rate.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
