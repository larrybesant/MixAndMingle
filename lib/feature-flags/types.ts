/**
 * Feature flag types and interfaces
 */

export type FeatureStatus = "enabled" | "disabled" | "beta" | "scheduled" | "percentage"

export interface FeatureFlag {
  id: string
  name: string
  description: string
  status: FeatureStatus
  createdAt: Date
  updatedAt: Date

  // For beta access
  betaGroups?: string[] // IDs of beta groups that have access
  betaUserIds?: string[] // Specific user IDs that have access in beta

  // For percentage rollout
  rolloutPercentage?: number // 0-100

  // For scheduled release
  scheduledRelease?: Date

  // For A/B testing
  isABTest?: boolean
  variants?: {
    id: string
    name: string
    description: string
    weight: number // Percentage of users who should see this variant
  }[]

  // For overrides
  userOverrides?: {
    [userId: string]: {
      status: "enabled" | "disabled"
      variant?: string // For A/B test variants
    }
  }

  // For role-based access
  roleAccess?: {
    [role: string]: boolean
  }
}

export interface FeatureGroup {
  id: string
  name: string
  description: string
  features: string[] // Feature IDs
}

export interface BetaGroup {
  id: string
  name: string
  description: string
  userIds: string[]
  features: string[] // Feature IDs this group has access to
}

export interface UserFeatureAccess {
  userId: string
  features: {
    [featureId: string]: {
      hasAccess: boolean
      variant?: string // For A/B test variants
    }
  }
}
