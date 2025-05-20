"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { activityPatternML } from "@/lib/ml/activity-pattern-ml"
import { soundSettingsService } from "@/lib/sound-settings-service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Clock, Activity, Check, AlertTriangle, Sparkles, Brain, Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface MLPrediction {
  startTime: string
  endTime: string
  confidence: number
  weekdayPrediction: boolean
  weekendPrediction: boolean
}

export function MLQuietHoursSuggestions() {
  const [predictions, setPredictions] = useState<MLPrediction[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [separateWeekendSettings, setSeparateWeekendSettings] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const loadPredictions = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Get ML predictions
        const mlPredictions = await activityPatternML.generatePredictions(user.uid)
        setPredictions(mlPredictions)

        // Check if user has separate weekend settings
        const settings = await soundSettingsService.getSettings(user.uid)
        setSeparateWeekendSettings(settings?.quietHours?.separateWeekend || false)
      } catch (error) {
        console.error("Error loading ML predictions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPredictions()
  }, [user])

  const applyPrediction = async (prediction: MLPrediction) => {
    if (!user) return

    setApplying(true)
    try {
      if (prediction.weekdayPrediction && prediction.weekendPrediction) {
        // Apply to all days
        await soundSettingsService.updateQuietHours(user.uid, {
          enabled: true,
          startTime: prediction.startTime,
          endTime: prediction.endTime,
          separateWeekend: false,
          days: [0, 1, 2, 3, 4, 5, 6],
        })
      } else if (prediction.weekdayPrediction) {
        // Apply to weekdays only
        if (separateWeekendSettings) {
          await soundSettingsService.updateQuietHours(user.uid, {
            enabled: true,
            startTime: prediction.startTime,
            endTime: prediction.endTime,
            separateWeekend: true,
            days: [1, 2, 3, 4, 5],
          })
        } else {
          await soundSettingsService.updateQuietHours(user.uid, {
            enabled: true,
            startTime: prediction.startTime,
            endTime: prediction.endTime,
            days: [1, 2, 3, 4, 5],
          })
        }
      } else if (prediction.weekendPrediction) {
        // Apply to weekends only
        await soundSettingsService.updateQuietHours(user.uid, {
          enabled: true,
          separateWeekend: true,
          weekendStartTime: prediction.startTime,
          weekendEndTime: prediction.endTime,
          weekendDays: [0, 6],
        })
      }

      toast({
        title: "Quiet hours updated",
        description: `Your quiet hours have been set based on ML predictions for ${
          prediction.weekdayPrediction ? "weekdays" : "weekends"
        }.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error applying ML prediction:", error)
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

  const getDayTypeBadge = (prediction: MLPrediction) => {
    if (prediction.weekdayPrediction && prediction.weekendPrediction) {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Calendar className="mr-1 h-3 w-3" />
          All Days
        </Badge>
      )
    } else if (prediction.weekdayPrediction) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Calendar className="mr-1 h-3 w-3" />
          Weekdays
        </Badge>
      )
    } else if (prediction.weekendPrediction) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Calendar className="mr-1 h-3 w-3" />
          Weekends
        </Badge>
      )
    }
    return null
  }

  const generateReason = (prediction: MLPrediction) => {
    const dayType = prediction.weekdayPrediction
      ? prediction.weekendPrediction
        ? "throughout the week"
        : "on weekdays"
      : "on weekends"

    const startHour = Number.parseInt(prediction.startTime.split(":")[0])
    const endHour = Number.parseInt(prediction.endTime.split(":")[0])
    const duration = endHour > startHour ? endHour - startHour : 24 - startHour + endHour

    const confidenceText =
      prediction.confidence > 0.8 ? "very low" : prediction.confidence > 0.6 ? "low" : "relatively low"

    if (startHour > 18 || startHour < 6) {
      // Night-time quiet hours
      return `Our ML algorithm detected ${confidenceText} activity ${dayType} between ${formatTime(
        prediction.startTime,
      )} and ${formatTime(prediction.endTime)}, which suggests this might be when you're sleeping or resting.`
    } else {
      // Daytime quiet hours
      return `Our ML algorithm detected ${confidenceText} activity for about ${duration} hours ${dayType} starting at ${formatTime(
        prediction.startTime,
      )}, which might be a good time to mute notifications.`
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Brain className="mr-2 h-5 w-5 text-purple-500" />
              ML-Powered Quiet Hours
            </CardTitle>
            <CardDescription>Advanced predictions based on your activity patterns</CardDescription>
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
        ) : predictions.length === 0 ? (
          <div className="text-center py-6">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Not Enough Data</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Our ML system needs more activity data to generate accurate predictions. Continue using Mix & Mingle, and
              we'll provide personalized suggestions soon.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="separate-weekend"
                checked={separateWeekendSettings}
                onCheckedChange={setSeparateWeekendSettings}
              />
              <Label htmlFor="separate-weekend">Enable separate weekend settings</Label>
            </div>

            <Tabs defaultValue="weekday" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="weekday">Weekday Prediction</TabsTrigger>
                <TabsTrigger value="weekend">Weekend Prediction</TabsTrigger>
              </TabsList>
              {predictions
                .filter((p) => p.weekdayPrediction)
                .map((prediction, index) => (
                  <TabsContent key={`weekday-${index}`} value="weekday" className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium flex items-center">
                          <Clock className="mr-2 h-5 w-5 text-blue-500" />
                          Weekday Quiet Hours
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{generateReason(prediction)}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getConfidenceBadge(prediction.confidence)}
                        {getDayTypeBadge(prediction)}
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Start Time</p>
                          <p className="text-2xl font-bold">{formatTime(prediction.startTime)}</p>
                        </div>
                        <div className="text-center text-muted-foreground">to</div>
                        <div className="text-right">
                          <p className="text-sm font-medium">End Time</p>
                          <p className="text-2xl font-bold">{formatTime(prediction.endTime)}</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => applyPrediction(prediction)}
                      disabled={applying}
                      className="w-full"
                      variant="default"
                    >
                      {applying ? "Applying..." : "Apply Weekday Prediction"}
                    </Button>
                  </TabsContent>
                ))}

              {predictions
                .filter((p) => p.weekendPrediction)
                .map((prediction, index) => (
                  <TabsContent key={`weekend-${index}`} value="weekend" className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium flex items-center">
                          <Clock className="mr-2 h-5 w-5 text-amber-500" />
                          Weekend Quiet Hours
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{generateReason(prediction)}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getConfidenceBadge(prediction.confidence)}
                        {getDayTypeBadge(prediction)}
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Start Time</p>
                          <p className="text-2xl font-bold">{formatTime(prediction.startTime)}</p>
                        </div>
                        <div className="text-center text-muted-foreground">to</div>
                        <div className="text-right">
                          <p className="text-sm font-medium">End Time</p>
                          <p className="text-2xl font-bold">{formatTime(prediction.endTime)}</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => applyPrediction(prediction)}
                      disabled={applying || !separateWeekendSettings}
                      className="w-full"
                      variant="default"
                    >
                      {applying
                        ? "Applying..."
                        : separateWeekendSettings
                          ? "Apply Weekend Prediction"
                          : "Enable separate weekend settings first"}
                    </Button>
                  </TabsContent>
                ))}

              {predictions.filter((p) => p.weekendPrediction).length === 0 && (
                <TabsContent value="weekend" className="py-6 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Weekend Predictions</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    We don't have enough weekend activity data yet to make accurate predictions.
                  </p>
                </TabsContent>
              )}

              {predictions.filter((p) => p.weekdayPrediction).length === 0 && (
                <TabsContent value="weekday" className="py-6 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Weekday Predictions</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    We don't have enough weekday activity data yet to make accurate predictions.
                  </p>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-xs text-muted-foreground">
          <p className="flex items-center">
            <Brain className="inline-block mr-1 h-3 w-3" />
            Our ML system analyzes your activity patterns to suggest optimal quiet hours.
          </p>
          <p className="mt-1">Predictions improve with more usage data and are updated weekly.</p>
        </div>
      </CardFooter>
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
