"use client"

import { useState, useEffect } from "react"
import type { DateRange } from "react-day-picker"

// Simple heat map component
function HeatMap({
  data,
  rowLabels,
  colLabels,
}: {
  data: number[][]
  rowLabels: string[]
  colLabels: string[]
}) {
  // Find the maximum value for color scaling
  const maxValue = Math.max(...data.flat())

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2"></th>
            {colLabels.map((label, i) => (
              <th key={i} className="p-2 text-xs font-normal text-muted-foreground">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="p-2 text-xs font-medium">{rowLabels[rowIndex]}</td>
              {row.map((value, colIndex) => {
                // Calculate color intensity based on value
                const intensity = maxValue > 0 ? (value / maxValue) * 100 : 0
                return (
                  <td key={colIndex} className="p-0">
                    <div
                      className="w-12 h-12 flex items-center justify-center text-xs"
                      style={{
                        backgroundColor: `rgba(var(--primary-rgb), ${intensity / 100})`,
                        color: intensity > 50 ? "white" : "inherit",
                      }}
                      title={`${value}%`}
                    >
                      {value}%
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface BetaRetentionChartProps {
  dateRange: DateRange
}

export function BetaRetentionChart({ dateRange }: BetaRetentionChartProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [retentionData, setRetentionData] = useState<number[][]>([])
  const [cohortLabels, setCohortLabels] = useState<string[]>([])
  const [weekLabels, setWeekLabels] = useState<string[]>([])

  useEffect(() => {
    const fetchRetentionData = async () => {
      if (!dateRange.from || !dateRange.to) return

      setIsLoading(true)

      try {
        // In a real implementation, you would fetch this data from Firestore
        // For this example, we'll generate sample data

        // Generate cohort labels (weeks)
        const cohorts = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]
        setCohortLabels(cohorts)

        // Generate week labels
        const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"]
        setWeekLabels(weeks)

        // Generate sample retention data
        // Each row represents a cohort, each column represents a week
        const data = [
          [100, 86, 72, 65, 58, 52, 48, 45], // Week 1 cohort
          [100, 82, 68, 60, 54, 50, 46, 0], // Week 2 cohort
          [100, 84, 70, 62, 56, 0, 0, 0], // Week 3 cohort
          [100, 80, 66, 0, 0, 0, 0, 0], // Week 4 cohort
          [100, 78, 0, 0, 0, 0, 0, 0], // Week 5 cohort
        ]

        setRetentionData(data)
      } catch (error) {
        console.error("Error fetching retention data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRetentionData()
  }, [dateRange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Cohort Retention Analysis</h3>
        <p className="text-sm text-muted-foreground">
          This chart shows what percentage of users from each weekly cohort returned in subsequent weeks.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <HeatMap data={retentionData} rowLabels={cohortLabels} colLabels={weekLabels} />
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        <p>
          The Week 1 cohort shows the strongest retention, with 45% still active after 8 weeks. Each cohort shows a
          typical drop-off pattern, with the steepest decline occurring between weeks 1 and 3.
        </p>
      </div>
    </div>
  )
}
