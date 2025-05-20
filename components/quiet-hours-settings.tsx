"use client"

import { useState, useEffect } from "react"
import { Moon, Clock } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"
import { soundSettingsService, type QuietHoursSettingsType } from "@/lib/sound-settings-service"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityPatternAnalysis } from "@/components/activity-pattern-analysis"

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function QuietHoursSettings() {
  const [quietHours, setQuietHours] = useState<QuietHoursSettingsType>({
    enabled: false,
    startTime: "22:00",
    endTime: "07:00",
    daysOfWeek: [true, true, true, true, true, true, true],
  })
  const [loading, setLoading] = useState(true)
  const [isActive, setIsActive] = useState(false)
  const { user } = useAuth()

  // Load quiet hours settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return

      try {
        const settings = await soundSettingsService.initialize(user.uid)
        setQuietHours(settings.quietHours)
        setIsActive(soundSettingsService.isQuietHoursActive(settings))
        setLoading(false)
      } catch (error) {
        console.error("Error loading quiet hours settings:", error)
        setLoading(false)
      }
    }

    loadSettings()

    // Check active status every minute
    const interval = setInterval(() => {
      const settings = soundSettingsService.getCurrentSettings()
      if (settings) {
        setIsActive(soundSettingsService.isQuietHoursActive(settings))
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [user])

  // Handle toggle for enabled state
  const handleEnabledChange = async (checked: boolean) => {
    if (!user) return

    const updatedQuietHours = { ...quietHours, enabled: checked }
    setQuietHours(updatedQuietHours)

    try {
      await soundSettingsService.updateQuietHours(user.uid, { enabled: checked })
      // Update active status
      const settings = soundSettingsService.getCurrentSettings()
      if (settings) {
        setIsActive(soundSettingsService.isQuietHoursActive(settings))
      }
    } catch (error) {
      console.error("Error updating quiet hours enabled state:", error)
    }
  }

  // Handle time change
  const handleTimeChange = async (field: "startTime" | "endTime", value: string) => {
    if (!user) return

    // Validate time format (HH:MM)
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
      return
    }

    const updatedQuietHours = { ...quietHours, [field]: value }
    setQuietHours(updatedQuietHours)

    try {
      await soundSettingsService.updateQuietHours(user.uid, { [field]: value })
      // Update active status
      const settings = soundSettingsService.getCurrentSettings()
      if (settings) {
        setIsActive(soundSettingsService.isQuietHoursActive(settings))
      }
    } catch (error) {
      console.error(`Error updating quiet hours ${field}:`, error)
    }
  }

  // Handle day of week toggle
  const handleDayToggle = async (dayIndex: number) => {
    if (!user) return

    const newDaysOfWeek = [...quietHours.daysOfWeek]
    newDaysOfWeek[dayIndex] = !newDaysOfWeek[dayIndex]

    const updatedQuietHours = { ...quietHours, daysOfWeek: newDaysOfWeek }
    setQuietHours(updatedQuietHours)

    try {
      await soundSettingsService.updateQuietHours(user.uid, { daysOfWeek: newDaysOfWeek })
      // Update active status
      const settings = soundSettingsService.getCurrentSettings()
      if (settings) {
        setIsActive(soundSettingsService.isQuietHoursActive(settings))
      }
    } catch (error) {
      console.error("Error updating quiet hours days of week:", error)
    }
  }

  if (loading) {
    return <div>Loading quiet hours settings...</div>
  }

  return (
    <Tabs defaultValue="manual">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="manual">Manual Settings</TabsTrigger>
        <TabsTrigger value="smart">Smart Suggestions</TabsTrigger>
      </TabsList>

      <TabsContent value="manual">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quiet Hours</CardTitle>
                <CardDescription>Set times when notification sounds will be muted</CardDescription>
              </div>
              {isActive && quietHours.enabled && (
                <Badge variant="secondary" className="gap-1">
                  <Moon className="h-3 w-3" />
                  <span>Active Now</span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="quiet-hours-enabled">Enable Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically mute notification sounds during specified hours
                </p>
              </div>
              <Switch id="quiet-hours-enabled" checked={quietHours.enabled} onCheckedChange={handleEnabledChange} />
            </div>

            <div className="space-y-4">
              <Label>Time Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time" className="text-sm">
                    Start Time
                  </Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="start-time"
                      type="time"
                      value={quietHours.startTime}
                      onChange={(e) => handleTimeChange("startTime", e.target.value)}
                      disabled={!quietHours.enabled}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time" className="text-sm">
                    End Time
                  </Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="end-time"
                      type="time"
                      value={quietHours.endTime}
                      onChange={(e) => handleTimeChange("endTime", e.target.value)}
                      disabled={!quietHours.enabled}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {quietHours.startTime > quietHours.endTime
                  ? `Quiet hours will be active from ${quietHours.startTime} until ${quietHours.endTime} the next day.`
                  : `Quiet hours will be active from ${quietHours.startTime} until ${quietHours.endTime} on the same day.`}
              </p>
            </div>

            <div className="space-y-4">
              <Label>Days of Week</Label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day, index) => (
                  <div key={day} className="flex flex-col items-center">
                    <Checkbox
                      id={`day-${index}`}
                      checked={quietHours.daysOfWeek[index]}
                      onCheckedChange={() => handleDayToggle(index)}
                      disabled={!quietHours.enabled}
                    />
                    <Label htmlFor={`day-${index}`} className="mt-1 text-xs font-normal">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {isActive && quietHours.enabled && (
              <div className="bg-secondary/50 p-3 rounded-md flex items-center">
                <Moon className="h-4 w-4 mr-2" />
                <p className="text-sm">Quiet hours are currently active. Notification sounds are muted.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="smart">
        <ActivityPatternAnalysis />
      </TabsContent>
    </Tabs>
  )
}
