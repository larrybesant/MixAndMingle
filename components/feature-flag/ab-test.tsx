/**
 * ABTest Component
 *
 * Renders different content based on A/B test variants
 */

import type { ReactNode } from "react"
import { useFeature } from "@/hooks/use-feature"
import { Skeleton } from "@/components/ui/skeleton"

interface ABTestProps {
  featureId: string
  variants: {
    [variantId: string]: ReactNode
  }
  fallback?: ReactNode
  loadingFallback?: ReactNode
}

export function ABTest({
  featureId,
  variants,
  fallback = null,
  loadingFallback = <Skeleton className="h-8 w-full" />,
}: ABTestProps) {
  const { hasAccess, variant, isLoading } = useFeature(featureId)

  if (isLoading) {
    return <>{loadingFallback}</>
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  // If no variant is assigned or the variant doesn't exist in the variants object,
  // use the first variant as a fallback
  const variantToRender = variant && variants[variant] ? variants[variant] : Object.values(variants)[0] || fallback

  return <>{variantToRender}</>
}
