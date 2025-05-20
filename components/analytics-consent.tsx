"use client"

import { useState, useEffect } from "react"
import { useAnalytics } from "@/hooks/use-analytics"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function AnalyticsConsent() {
  const { isEnabled, setEnabled } = useAnalytics()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const hasChoice = localStorage.getItem("analytics_choice_made") === "true"

    if (!hasChoice) {
      // Show consent dialog after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    setEnabled(true)
    localStorage.setItem("analytics_choice_made", "true")
    setIsVisible(false)
  }

  const handleDecline = () => {
    setEnabled(false)
    localStorage.setItem("analytics_choice_made", "true")
    setIsVisible(false)
  }

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Analytics Consent</CardTitle>
          <CardDescription>
            Help us improve Mix & Mingle by allowing us to collect anonymous usage data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We use analytics to understand how you use our platform and improve your experience. All data is anonymized
            and we never collect personally identifiable information.
          </p>

          <div className="flex items-center space-x-2">
            <Switch id="analytics-consent" checked={isEnabled} onCheckedChange={handleToggle} />
            <Label htmlFor="analytics-consent">Enable analytics</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleDecline}>
            Decline
          </Button>
          <Button onClick={handleAccept}>Accept</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
