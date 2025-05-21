/**
 * Available Features Component
 *
 * Displays the features available to a beta tester
 */

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useFeatureFlags } from "@/lib/feature-flags/feature-flag-context"
import type { FeatureFlag } from "@/lib/feature-flags/types"
import { CheckCircle, XCircle } from "lucide-react"

export function AvailableFeatures() {
  const { features, hasAccess, isLoading } = useFeatureFlags()
  const [availableFeatures, setAvailableFeatures] = useState<FeatureFlag[]>([])
  const [unavailableFeatures, setUnavailableFeatures] = useState<FeatureFlag[]>([])

  useEffect(() => {
    if (!isLoading) {
      const available: FeatureFlag[] = []
      const unavailable: FeatureFlag[] = []

      features.forEach((feature) => {
        if (hasAccess(feature.id)) {
          available.push(feature)
        } else {
          unavailable.push(feature)
        }
      })

      setAvailableFeatures(available)
      setUnavailableFeatures(unavailable)
    }
  }, [features, hasAccess, isLoading])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Features</CardTitle>
          <CardDescription>Loading your beta features...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Beta Features</CardTitle>
        <CardDescription>Features available to you as a beta tester</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Available Features
            </h3>
            {availableFeatures.length === 0 ? (
              <p className="text-sm text-muted-foreground">No features available yet.</p>
            ) : (
              <div className="grid gap-2">
                {availableFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-start p-2 border rounded-md">
                    <div>
                      <div className="font-medium">{feature.name}</div>
                      <div className="text-sm text-muted-foreground">{feature.description}</div>
                      {feature.isABTest && <Badge className="mt-1 bg-blue-500">A/B Test</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium flex items-center mb-2">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              Coming Soon
            </h3>
            {unavailableFeatures.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming features.</p>
            ) : (
              <div className="grid gap-2">
                {unavailableFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-start p-2 border rounded-md opacity-60">
                    <div>
                      <div className="font-medium">{feature.name}</div>
                      <div className="text-sm text-muted-foreground">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
