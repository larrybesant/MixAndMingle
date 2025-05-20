"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { abTestingService, type ABTest, type ABTestVariant } from "./ab-testing-service"
import { useAuth } from "./auth-context"

interface ABTestingContextType {
  isLoading: boolean
  activeTests: ABTest[]
  getUserVariant: (testId: string) => Promise<ABTestVariant | null>
  trackImpression: (testId: string, variantId: string) => Promise<void>
  trackConversion: (testId: string, variantId: string, metadata?: Record<string, any>) => Promise<void>
  trackEvent: (testId: string, variantId: string, eventName: string, metadata?: Record<string, any>) => Promise<void>
}

const ABTestingContext = createContext<ABTestingContextType | undefined>(undefined)

export function ABTestingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTests, setActiveTests] = useState<ABTest[]>([])
  const [userAssignments, setUserAssignments] = useState<Record<string, string>>({})

  // Load active tests
  useEffect(() => {
    const loadActiveTests = async () => {
      try {
        const tests = await abTestingService.getActiveTests()
        setActiveTests(tests)
      } catch (error) {
        console.error("Error loading active tests:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadActiveTests()
  }, [])

  // Load user assignments when user changes
  useEffect(() => {
    const loadUserAssignments = async () => {
      if (!user) {
        setUserAssignments({})
        return
      }

      try {
        const assignments = await abTestingService.getUserAssignments(user.uid)
        const assignmentsMap: Record<string, string> = {}

        assignments.forEach((assignment) => {
          assignmentsMap[assignment.testId] = assignment.variantId
        })

        setUserAssignments(assignmentsMap)
      } catch (error) {
        console.error("Error loading user assignments:", error)
      }
    }

    loadUserAssignments()
  }, [user])

  const getUserVariant = async (testId: string): Promise<ABTestVariant | null> => {
    if (!user) return null

    try {
      // Check if we already have the assignment
      if (userAssignments[testId]) {
        const test = activeTests.find((t) => t.id === testId)
        if (test) {
          const variant = test.variants.find((v) => v.id === userAssignments[testId])
          if (variant) return variant
        }
      }

      // If not, assign the user to a variant
      const variantId = await abTestingService.assignUserToVariant(user.uid, testId)

      // Update local state
      setUserAssignments((prev) => ({
        ...prev,
        [testId]: variantId,
      }))

      // Return the variant
      const test = activeTests.find((t) => t.id === testId)
      if (test) {
        const variant = test.variants.find((v) => v.id === variantId)
        if (variant) return variant
      }

      return null
    } catch (error) {
      console.error("Error getting user variant:", error)
      return null
    }
  }

  const trackImpression = async (testId: string, variantId: string) => {
    if (!user) return

    try {
      await abTestingService.trackEvent({
        userId: user.uid,
        testId,
        variantId,
        eventName: "impression",
      })
    } catch (error) {
      console.error("Error tracking impression:", error)
    }
  }

  const trackConversion = async (testId: string, variantId: string, metadata?: Record<string, any>) => {
    if (!user) return

    try {
      await abTestingService.trackEvent({
        userId: user.uid,
        testId,
        variantId,
        eventName: "conversion",
        metadata,
      })
    } catch (error) {
      console.error("Error tracking conversion:", error)
    }
  }

  const trackEvent = async (testId: string, variantId: string, eventName: string, metadata?: Record<string, any>) => {
    if (!user) return

    try {
      await abTestingService.trackEvent({
        userId: user.uid,
        testId,
        variantId,
        eventName,
        metadata,
      })
    } catch (error) {
      console.error("Error tracking event:", error)
    }
  }

  return (
    <ABTestingContext.Provider
      value={{
        isLoading,
        activeTests,
        getUserVariant,
        trackImpression,
        trackConversion,
        trackEvent,
      }}
    >
      {children}
    </ABTestingContext.Provider>
  )
}

export function useABTesting() {
  const context = useContext(ABTestingContext)
  if (context === undefined) {
    throw new Error("useABTesting must be used within an ABTestingProvider")
  }
  return context
}
