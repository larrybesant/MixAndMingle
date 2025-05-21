/**
 * Hook for checking feature access
 */

import { useFeatureFlags } from "@/lib/feature-flags/feature-flag-context"

export function useFeature(featureId: string) {
  const { hasAccess, getVariant, isLoading } = useFeatureFlags()

  return {
    hasAccess: hasAccess(featureId),
    variant: getVariant(featureId),
    isLoading,
  }
}
