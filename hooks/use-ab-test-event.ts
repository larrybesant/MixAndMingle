"use client"

import { useCallback } from "react"
import { useABTesting } from "@/lib/ab-testing-context"

export function useABTestEvent(testId: string, variantId: string) {
  const { trackEvent, trackConversion } = useABTesting()

  const logEvent = useCallback(
    (eventName: string, metadata?: Record<string, any>) => {
      trackEvent(testId, variantId, eventName, metadata)
    },
    [testId, variantId, trackEvent],
  )

  const logConversion = useCallback(
    (metadata?: Record<string, any>) => {
      trackConversion(testId, variantId, metadata)
    },
    [testId, variantId, trackConversion],
  )

  return {
    logEvent,
    logConversion,
  }
}
