/**
 * Feature Flag Context
 *
 * Provides access to feature flags throughout the application
 */

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { featureFlagService } from "./feature-flag-service"
import type { FeatureFlag, UserFeatureAccess } from "./types"
import { useAuth } from "@/lib/auth-context"

interface FeatureFlagContextType {
  features: FeatureFlag[]
  userAccess: UserFeatureAccess | null
  isLoading: boolean
  error: Error | null
  hasAccess: (featureId: string) => boolean
  getVariant: (featureId: string) => string | undefined
  refreshFeatures: () => Promise<void>
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined)

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [features, setFeatures] = useState<FeatureFlag[]>([])
  const [userAccess, setUserAccess] = useState<UserFeatureAccess | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load features and user access
  useEffect(() => {
    const loadFeatures = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load all features
        const allFeatures = await featureFlagService.getAllFeatures()
        setFeatures(allFeatures)

        // Load user access if user is logged in
        if (user) {
          const access = await featureFlagService.getUserFeatureAccess(user.uid)
          setUserAccess(access)
        } else {
          setUserAccess(null)
        }
      } catch (err) {
        console.error("Error loading feature flags:", err)
        setError(err instanceof Error ? err : new Error("Failed to load feature flags"))
      } finally {
        setIsLoading(false)
      }
    }

    loadFeatures()
  }, [user])

  // Determine if a user has access to a feature
  const hasAccess = (featureId: string): boolean => {
    // Find the feature
    const feature = features.find((f) => f.id === featureId)

    // If feature doesn't exist, no access
    if (!feature) {
      return false
    }

    // Check user-specific overrides first
    if (user && feature.userOverrides && feature.userOverrides[user.uid]) {
      return feature.userOverrides[user.uid].status === "enabled"
    }

    // Check user-specific access in the userAccess object
    if (user && userAccess && userAccess.features[featureId]) {
      return userAccess.features[featureId].hasAccess
    }

    // Check feature status
    switch (feature.status) {
      case "enabled":
        return true

      case "disabled":
        return false

      case "beta":
        // If not logged in, no beta access
        if (!user) return false

        // Check if user is in betaUserIds
        if (feature.betaUserIds && feature.betaUserIds.includes(user.uid)) {
          return true
        }

        // Check if user is in any of the beta groups
        // This is a simplified check - in production you'd want to check the actual groups
        return false

      case "scheduled":
        // If scheduled release date is in the past, enable the feature
        return feature.scheduledRelease ? new Date() >= feature.scheduledRelease : false

      case "percentage":
        // If not logged in, use a random number
        if (!user) {
          return Math.random() * 100 < (feature.rolloutPercentage || 0)
        }

        // For logged in users, use a deterministic approach based on user ID
        // This ensures the same user always gets the same experience
        const hash = hashString(user.uid)
        return hash % 100 < (feature.rolloutPercentage || 0)

      default:
        return false
    }
  }

  // Get the variant for an A/B test feature
  const getVariant = (featureId: string): string | undefined => {
    // Find the feature
    const feature = features.find((f) => f.id === featureId)

    // If feature doesn't exist or is not an A/B test, return undefined
    if (!feature || !feature.isABTest || !feature.variants || feature.variants.length === 0) {
      return undefined
    }

    // Check user-specific overrides first
    if (user && feature.userOverrides && feature.userOverrides[user.uid]) {
      return feature.userOverrides[user.uid].variant
    }

    // Check user-specific variant in the userAccess object
    if (user && userAccess && userAccess.features[featureId]) {
      return userAccess.features[featureId].variant
    }

    // If not logged in or no specific variant assigned, use weighted random selection
    // For logged in users, use a deterministic approach based on user ID
    const seed = user ? hashString(user.uid) % 100 : Math.random() * 100

    let cumulativeWeight = 0
    for (const variant of feature.variants) {
      cumulativeWeight += variant.weight
      if (seed < cumulativeWeight) {
        return variant.id
      }
    }

    // Fallback to the first variant
    return feature.variants[0].id
  }

  // Refresh features from the server
  const refreshFeatures = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load all features
      const allFeatures = await featureFlagService.getAllFeatures()
      setFeatures(allFeatures)

      // Load user access if user is logged in
      if (user) {
        const access = await featureFlagService.getUserFeatureAccess(user.uid)
        setUserAccess(access)
      } else {
        setUserAccess(null)
      }
    } catch (err) {
      console.error("Error refreshing feature flags:", err)
      setError(err instanceof Error ? err : new Error("Failed to refresh feature flags"))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FeatureFlagContext.Provider
      value={{
        features,
        userAccess,
        isLoading,
        error,
        hasAccess,
        getVariant,
        refreshFeatures,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  )
}

// Helper function to create a hash from a string
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Hook to use feature flags
export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext)

  if (context === undefined) {
    throw new Error("useFeatureFlags must be used within a FeatureFlagProvider")
  }

  return context
}
