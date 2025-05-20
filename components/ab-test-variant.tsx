"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useABTesting } from "@/lib/ab-testing-context"

interface ABTestVariantProps {
  testId: string
  variants: {
    [variantId: string]: ReactNode
  }
  fallback?: ReactNode
  trackImpression?: boolean
}

export function ABTestVariant({ testId, variants, fallback = null, trackImpression = true }: ABTestVariantProps) {
  const { getUserVariant, trackImpression: trackImpressionEvent } = useABTesting()
  const [variantId, setVariantId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadVariant = async () => {
      try {
        const variant = await getUserVariant(testId)
        if (variant) {
          setVariantId(variant.id)

          // Track impression if enabled
          if (trackImpression) {
            trackImpressionEvent(testId, variant.id)
          }
        }
      } catch (error) {
        console.error("Error loading variant:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVariant()
  }, [testId, getUserVariant, trackImpression, trackImpressionEvent])

  if (isLoading) {
    // You could return a loading state here, or just the fallback
    return fallback
  }

  if (!variantId || !variants[variantId]) {
    return fallback
  }

  return <>{variants[variantId]}</>
}
