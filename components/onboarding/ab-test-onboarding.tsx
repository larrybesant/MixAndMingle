"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ABTestVariant } from "@/components/ab-test-variant"
import { StandardOnboarding } from "@/components/onboarding/standard-onboarding"
import { MinimalOnboarding } from "@/components/onboarding/minimal-onboarding"
import { GamifiedOnboarding } from "@/components/onboarding/gamified-onboarding"
import { useABTesting } from "@/lib/ab-testing-context"
import { Skeleton } from "@/components/ui/skeleton"

export function ABTestOnboarding() {
  const [isLoading, setIsLoading] = useState(true)
  const { isLoading: isABTestingLoading } = useABTesting()
  const router = useRouter()

  useEffect(() => {
    // Set loading state based on AB testing context
    setIsLoading(isABTestingLoading)
  }, [isABTestingLoading])

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-64 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    )
  }

  return (
    <ABTestVariant
      testId="onboarding-experience"
      variants={{
        standard: <StandardOnboarding />,
        minimal: <MinimalOnboarding />,
        gamified: <GamifiedOnboarding />,
      }}
      fallback={<StandardOnboarding />}
    />
  )
}
