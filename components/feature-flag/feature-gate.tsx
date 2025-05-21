/**
 * FeatureGate Component
 *
 * Conditionally renders content based on feature flag status
 */

import type { ReactNode } from "react"
import { useFeature } from "@/hooks/use-feature"
import { Skeleton } from "@/components/ui/skeleton"

interface FeatureGateProps {
  featureId: string
  children: ReactNode
  fallback?: ReactNode
  loadingFallback?: ReactNode
}

export function FeatureGate({
  featureId,
  children,
  fallback = null,
  loadingFallback = <Skeleton className="h-8 w-full" />,
}: FeatureGateProps) {
  const { hasAccess, isLoading } = useFeature(featureId)

  if (isLoading) {
    return <>{loadingFallback}</>
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
