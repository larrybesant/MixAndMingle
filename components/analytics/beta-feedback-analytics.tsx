"use client"

import { useState, useEffect } from "react"
import type { DateRange } from "react-day-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BugIcon, MessageSquareIcon, CheckCircleIcon } from "lucide-react"

// Simple pie chart component
function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = 0

  return (
    <div className="relative w-64 h-64 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {data.map((item, index) => {
          if (item.value === 0) return null

          const percentage = total > 0 ? (item.value / total) * 100 : 0
          const angle = (percentage / 100) * 360

          // Calculate the SVG arc path
          const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180)
          const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180)

          currentAngle += angle

          const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180)
          const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180)

          const largeArcFlag = angle > 180 ? 1 : 0

          const pathData = [`M 50 50`, `L ${x1} ${y1}`, `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`, `Z`].join(" ")

          return <path key={index} d={pathData} fill={item.color} stroke="white" strokeWidth="0.5" />
        })}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-2xl font-bold">{total}</div>
      </div>
    </div>
  )
}

// Legend component
function Legend({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="grid grid-cols-1 gap-2 mt-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center">
          <div className="w-4 h-4 mr-2" style={{ backgroundColor: item.color }}></div>
          <span className="flex-1">{item.label}</span>
          <span className="font-medium">{item.value}</span>
          <span className="text-muted-foreground ml-2">
            ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
          </span>
        </div>
      ))}
    </div>
  )
}

interface BetaFeedbackAnalyticsProps {
  dateRange: DateRange
}

export function BetaFeedbackAnalytics({ dateRange }: BetaFeedbackAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [feedbackByType, setFeedbackByType] = useState<{ label: string; value: number; color: string }[]>([
    { label: "Bug Reports", value: 0, color: "#ef4444" },
    { label: "Feature Suggestions", value: 0, color: "#3b82f6" },
    { label: "General Feedback", value: 0, color: "#8b5cf6" },
  ])

  const [feedbackByStatus, setFeedbackByStatus] = useState<{ label: string; value: number; color: string }[]>([
    { label: "Pending", value: 0, color: "#9ca3af" },
    { label: "In Progress", value: 0, color: "#f59e0b" },
    { label: "Completed", value: 0, color: "#10b981" },
    { label: "Rejected", value: 0, color: "#ef4444" },
  ])

  const [feedbackByFeature, setFeedbackByFeature] = useState<{ label: string; value: number; color: string }[]>([
    { label: "Chat Rooms", value: 0, color: "#8b5cf6" },
    { label: "Video Rooms", value: 0, color: "#3b82f6" },
    { label: "DJ Rooms", value: 0, color: "#ec4899" },
    { label: "User Profiles", value: 0, color: "#10b981" },
    { label: "Notifications", value: 0, color: "#f59e0b" },
    { label: "Other", value: 0, color: "#9ca3af" },
  ])

  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!dateRange.from || !dateRange.to) return

      setIsLoading(true)

      try {
        // In a real implementation, you would fetch this data from Firestore
        // For this example, we'll generate sample data

        // Sample data for feedback by type
        setFeedbackByType([
          { label: "Bug Reports", value: 42, color: "#ef4444" },
          { label: "Feature Suggestions", value: 67, color: "#3b82f6" },
          { label: "General Feedback", value: 31, color: "#8b5cf6" },
        ])

        // Sample data for feedback by status
        setFeedbackByStatus([
          { label: "Pending", value: 28, color: "#9ca3af" },
          { label: "In Progress", value: 35, color: "#f59e0b" },
          { label: "Completed", value: 53, color: "#10b981" },
          { label: "Rejected", value: 24, color: "#ef4444" },
        ])

        // Sample data for feedback by feature
        setFeedbackByFeature([
          { label: "Chat Rooms", value: 38, color: "#8b5cf6" },
          { label: "Video Rooms", value: 45, color: "#3b82f6" },
          { label: "DJ Rooms", value: 27, color: "#ec4899" },
          { label: "User Profiles", value: 12, color: "#10b981" },
          { label: "Notifications", value: 8, color: "#f59e0b" },
          { label: "Other", value: 10, color: "#9ca3af" },
        ])
      } catch (error) {
        console.error("Error fetching feedback data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedbackData()
  }, [dateRange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="type">
      <TabsList>
        <TabsTrigger value="type">By Type</TabsTrigger>
        <TabsTrigger value="status">By Status</TabsTrigger>
        <TabsTrigger value="feature">By Feature</TabsTrigger>
      </TabsList>

      <TabsContent value="type" className="pt-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <PieChart data={feedbackByType} />
          <div>
            <div className="flex items-center mb-4">
              <BugIcon className="h-5 w-5 mr-2 text-red-500" />
              <h3 className="text-lg font-medium">Feedback by Type</h3>
            </div>
            <Legend data={feedbackByType} />
            <p className="mt-4 text-sm text-muted-foreground">
              Feature suggestions make up the largest portion of feedback, indicating users are engaged and thinking
              about platform improvements.
            </p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="status" className="pt-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <PieChart data={feedbackByStatus} />
          <div>
            <div className="flex items-center mb-4">
              <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
              <h3 className="text-lg font-medium">Feedback by Status</h3>
            </div>
            <Legend data={feedbackByStatus} />
            <p className="mt-4 text-sm text-muted-foreground">
              Over 50% of feedback has been addressed (completed or in progress), showing good responsiveness to beta
              tester input.
            </p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="feature" className="pt-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <PieChart data={feedbackByFeature} />
          <div>
            <div className="flex items-center mb-4">
              <MessageSquareIcon className="h-5 w-5 mr-2 text-purple-500" />
              <h3 className="text-lg font-medium">Feedback by Feature</h3>
            </div>
            <Legend data={feedbackByFeature} />
            <p className="mt-4 text-sm text-muted-foreground">
              Video and chat rooms receive the most feedback, suggesting these are the most used and tested features in
              the beta.
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
