/**
 * Feature Flag Service
 *
 * Handles all interactions with feature flags in Firestore
 */

import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-client-safe"
import type { FeatureFlag, FeatureGroup, BetaGroup, UserFeatureAccess } from "./types"

// Collection names
const FEATURES_COLLECTION = "featureFlags"
const FEATURE_GROUPS_COLLECTION = "featureGroups"
const BETA_GROUPS_COLLECTION = "betaGroups"
const USER_FEATURE_ACCESS_COLLECTION = "userFeatureAccess"

export const featureFlagService = {
  /**
   * Get all feature flags
   */
  async getAllFeatures(): Promise<FeatureFlag[]> {
    const featuresSnapshot = await getDocs(collection(db, FEATURES_COLLECTION))
    return featuresSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        scheduledRelease: data.scheduledRelease?.toDate(),
      } as FeatureFlag
    })
  },

  /**
   * Get a specific feature flag
   */
  async getFeature(featureId: string): Promise<FeatureFlag | null> {
    const featureDoc = await getDoc(doc(db, FEATURES_COLLECTION, featureId))

    if (!featureDoc.exists()) {
      return null
    }

    const data = featureDoc.data()
    return {
      ...data,
      id: featureDoc.id,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      scheduledRelease: data.scheduledRelease?.toDate(),
    } as FeatureFlag
  },

  /**
   * Create a new feature flag
   */
  async createFeature(feature: Omit<FeatureFlag, "id" | "createdAt" | "updatedAt">): Promise<FeatureFlag> {
    const featureId = feature.name.toLowerCase().replace(/\s+/g, "-")

    const newFeature: FeatureFlag = {
      ...feature,
      id: featureId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await setDoc(doc(db, FEATURES_COLLECTION, featureId), {
      ...newFeature,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      scheduledRelease: newFeature.scheduledRelease || null,
    })

    return newFeature
  },

  /**
   * Update a feature flag
   */
  async updateFeature(featureId: string, updates: Partial<FeatureFlag>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(doc(db, FEATURES_COLLECTION, featureId), updateData)
  },

  /**
   * Delete a feature flag
   */
  async deleteFeature(featureId: string): Promise<void> {
    await deleteDoc(doc(db, FEATURES_COLLECTION, featureId))
  },

  /**
   * Get all feature groups
   */
  async getAllFeatureGroups(): Promise<FeatureGroup[]> {
    const groupsSnapshot = await getDocs(collection(db, FEATURE_GROUPS_COLLECTION))
    return groupsSnapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        }) as FeatureGroup,
    )
  },

  /**
   * Create a new feature group
   */
  async createFeatureGroup(group: Omit<FeatureGroup, "id">): Promise<FeatureGroup> {
    const groupId = group.name.toLowerCase().replace(/\s+/g, "-")

    const newGroup: FeatureGroup = {
      ...group,
      id: groupId,
    }

    await setDoc(doc(db, FEATURE_GROUPS_COLLECTION, groupId), newGroup)

    return newGroup
  },

  /**
   * Update a feature group
   */
  async updateFeatureGroup(groupId: string, updates: Partial<FeatureGroup>): Promise<void> {
    await updateDoc(doc(db, FEATURE_GROUPS_COLLECTION, groupId), updates)
  },

  /**
   * Delete a feature group
   */
  async deleteFeatureGroup(groupId: string): Promise<void> {
    await deleteDoc(doc(db, FEATURE_GROUPS_COLLECTION, groupId))
  },

  /**
   * Get all beta groups
   */
  async getAllBetaGroups(): Promise<BetaGroup[]> {
    const groupsSnapshot = await getDocs(collection(db, BETA_GROUPS_COLLECTION))
    return groupsSnapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        }) as BetaGroup,
    )
  },

  /**
   * Create a new beta group
   */
  async createBetaGroup(group: Omit<BetaGroup, "id">): Promise<BetaGroup> {
    const groupId = group.name.toLowerCase().replace(/\s+/g, "-")

    const newGroup: BetaGroup = {
      ...group,
      id: groupId,
    }

    await setDoc(doc(db, BETA_GROUPS_COLLECTION, groupId), newGroup)

    return newGroup
  },

  /**
   * Update a beta group
   */
  async updateBetaGroup(groupId: string, updates: Partial<BetaGroup>): Promise<void> {
    await updateDoc(doc(db, BETA_GROUPS_COLLECTION, groupId), updates)
  },

  /**
   * Delete a beta group
   */
  async deleteBetaGroup(groupId: string): Promise<void> {
    await deleteDoc(doc(db, BETA_GROUPS_COLLECTION, groupId))
  },

  /**
   * Get user feature access
   */
  async getUserFeatureAccess(userId: string): Promise<UserFeatureAccess | null> {
    const userAccessDoc = await getDoc(doc(db, USER_FEATURE_ACCESS_COLLECTION, userId))

    if (!userAccessDoc.exists()) {
      return null
    }

    return {
      ...userAccessDoc.data(),
      userId,
    } as UserFeatureAccess
  },

  /**
   * Set user feature access
   */
  async setUserFeatureAccess(userAccess: UserFeatureAccess): Promise<void> {
    await setDoc(doc(db, USER_FEATURE_ACCESS_COLLECTION, userAccess.userId), userAccess)
  },

  /**
   * Update user feature access for a specific feature
   */
  async updateUserFeatureAccess(
    userId: string,
    featureId: string,
    access: { hasAccess: boolean; variant?: string },
  ): Promise<void> {
    const userAccessRef = doc(db, USER_FEATURE_ACCESS_COLLECTION, userId)
    const userAccessDoc = await getDoc(userAccessRef)

    if (userAccessDoc.exists()) {
      await updateDoc(userAccessRef, {
        [`features.${featureId}`]: access,
      })
    } else {
      await setDoc(userAccessRef, {
        userId,
        features: {
          [featureId]: access,
        },
      })
    }
  },

  /**
   * Get beta testers for a feature
   */
  async getBetaTestersForFeature(featureId: string): Promise<string[]> {
    const feature = await this.getFeature(featureId)

    if (!feature || feature.status !== "beta") {
      return []
    }

    const userIds = new Set<string>(feature.betaUserIds || [])

    // Add users from beta groups
    if (feature.betaGroups && feature.betaGroups.length > 0) {
      const betaGroups = await Promise.all(
        feature.betaGroups.map((groupId) => getDoc(doc(db, BETA_GROUPS_COLLECTION, groupId))),
      )

      betaGroups.forEach((groupDoc) => {
        if (groupDoc.exists()) {
          const group = groupDoc.data() as BetaGroup
          group.userIds.forEach((userId) => userIds.add(userId))
        }
      })
    }

    return Array.from(userIds)
  },
}
