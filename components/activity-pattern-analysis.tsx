"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { activityTrackingService, type QuietHoursSuggestion } from "@/lib/activity-tracking-service"
import { soundSettingsService } from "@/lib/sound-settings-service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Activity, Check, AlertTriangle, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function ActivityPatternAnalysis() {
  const [suggestion, setSuggestion] = useState<QuietHoursSuggestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [hourlyActivity, setHourlyActivity] = useState<number[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const loadSuggestion = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Get activity summary
        const summary = await activityTrackingService.getActivitySummary(user.uid)
        if (summary) {
          setHourlyActivity(summary.hourlyActivity)
        }

        // Get quiet hours suggestion
        const suggestion = await activityTrackingService.suggestQuietHours(user.uid)
        setSuggestion(suggestion)
      } catch (error) {
        console.error("Error loading quiet hours suggestion:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSuggestion()
  }, [user])

  const applyQuietHoursSuggestion = async () => {
    if (!user || !suggestion) return

    setApplying(true)
    try {
      await soundSettingsService.updateQuietHours(user.uid, {
        enabled: true,
        startTime: suggestion.startTime,
        endTime: suggestion.endTime,
      })
      toast({
        title: "Quiet hours updated",
        description: "Your quiet hours have been set based on your activity patterns.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error applying quiet hours suggestion:", error)
      toast({
        title: "Error updating quiet hours",
        description: "There was a problem updating your quiet hours settings.",
        variant: "destructive",
      })
    } finally {
      setApplying(false)
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence > 0.8) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Check className="mr-1 h-3 w-3" />
          High Confidence
        </Badge>
      )
    } else if (confidence > 0.6) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Activity className="mr-1 h-3 w-3" />
          Medium Confidence
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Low Confidence
        </Badge>
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Pattern Analysis</CardTitle>
            <CardDescription>Smart quiet hours suggestions based on your usage patterns</CardDescription>
          </div>
          <Sparkles className="h-5 w-5 text-purple-500" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !suggestion ? (
          <div className="text-center py-6">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Not Enough Data</h3>
            <p className="text-sm text-muted-foreground mt-2">
              We need more activity data to suggest optimal quiet hours. Continue using Mix & Mingle, and we'll provide
              personalized suggestions soon.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-purple-500" />
                  Suggested Quiet Hours
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{suggestion.reason}</p>
              </div>
              {getConfidenceBadge(suggestion.confidence)}
            </div>

            <div className="bg-muted/50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Start Time</p>
                  <p className="text-2xl font-bold">{formatTime(suggestion.startTime)}</p>
                </div>
                <div className="text-center text-muted-foreground">to</div>
                <div className="text-right">
                  <p className="text-sm font-medium">End Time</p>
                  <p className="text-2xl font-bold">{formatTime(suggestion.endTime)}</p>
                </div>
              </div>
            </div>

            {hourlyActivity.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Your 24-Hour Activity Pattern</h4>
                <div className="h-20 flex items-end">
                  {hourlyActivity.map((activity, hour) => (
                    <div
                      key={hour}
                      className="flex-1 mx-px"
                      title={`${hour}:00 - Activity: ${Math.round(activity * 100)}%`}
                    >
                      <div
                        className={`w-full ${
                          isHourInRange(hour, suggestion.startTime, suggestion.endTime)
                            ? "bg-purple-300"
                            : "bg-blue-400"
                        }`}
                        style={{ height: `${Math.max(4, activity * 100)}%` }}
                      ></div>
                      {hour % 6 === 0 && <div className="text-xs text-muted-foreground mt-1 text-center">{hour}</div>}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-center text-muted-foreground mt-1">Hour of Day</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      {suggestion && (
        <CardFooter>
          <Button
            onClick={applyQuietHoursSuggestion}
            disabled={applying || !suggestion}
            className="w-full"
            variant="default"
          >
            {applying ? "Applying..." : "Apply Suggested Quiet Hours"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

// Helper function to format time from 24-hour to 12-hour format
function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const hours12 = hours % 12 || 12
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`
}

// Helper function to check if an hour is within the quiet hours range
function isHourInRange(hour: number, startTime: string, endTime: string): boolean {
  const startHour = Number.parseInt(startTime.split(":")[0])
  const endHour = Number.parseInt(endTime.split(":")[0])

  if (startHour <= endHour) {
    return hour >= startHour && hour < endHour
  } else {
    // Handle case where quiet hours span across midnight
    return hour >= startHour || hour < endHour
  }
}
