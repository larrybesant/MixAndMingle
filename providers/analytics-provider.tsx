"use client"

import { createContext, useEffect, useState, useContext, type ReactNode } from "react"
import {
  analyticsService,
  type AnalyticsEvent,
  type AnalyticsParams,
  type UserProperties,
} from "@/lib/analytics-service"
import { initializeAnalytics } from "@/lib/firebase-browser"
import { useAuth } from "@/hooks/use-auth"

// Define the context type
type AnalyticsContextType = {
  isEnabled: boolean
  setEnabled: (enabled: boolean) => void
  trackEvent: (eventName: AnalyticsEvent, eventParams?: AnalyticsParams) => void
  setUserProperties: (properties: UserProperties) => void
}

// Create the context with default values
const AnalyticsContext = createContext<AnalyticsContextType>({
  isEnabled: false,
  setEnabled: () => {},
  trackEvent: () => {},
  setUserProperties: () => {},
})

// Provider component
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setIsEnabled] = useState<boolean>(
    typeof window !== "undefined" ? localStorage.getItem("analytics_opt_out") !== "true" : false,
  )
  const [isInitialized, setIsInitialized] = useState(false)
  const { user } = useAuth()

  // Initialize analytics
  useEffect(() => {
    const initAnalytics = async () => {
      try {
        const analytics = await initializeAnalytics()
        if (analytics) {
          analyticsService.initialize(analytics)
          setIsInitialized(true)
        }
      } catch (error) {
        console.error("Error initializing analytics:", error)
      }
    }

    if (typeof window !== "undefined" && !isInitialized) {
      initAnalytics()
    }
  }, [isInitialized])

  // Set user ID when user changes
  useEffect(() => {
    if (isInitialized && user) {
      analyticsService.setUserId(user.uid)

      // Set basic user properties
      const userProperties: UserProperties = {
        user_type: user.customData?.subscription?.plan || "free",
        account_age: user.customData?.createdAt
          ? Math.floor((Date.now() - user.customData.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24))
          : 0,
      }

      analyticsService.setUserProperties(userProperties)
    } else if (isInitialized && !user) {
      analyticsService.setUserId(null)
    }
  }, [isInitialized, user])

  // Toggle analytics enabled state
  const setEnabled = (enabled: boolean) => {
    setIsEnabled(enabled)
    analyticsService.setEnabled(enabled)
  }

  // Track an event
  const trackEvent = (eventName: AnalyticsEvent, eventParams?: AnalyticsParams) => {
    analyticsService.trackEvent(eventName, eventParams)
  }

  // Set user properties
  const setUserProperties = (properties: UserProperties) => {
    analyticsService.setUserProperties(properties)
  }

  return (
    <AnalyticsContext.Provider value={{ isEnabled, setEnabled, trackEvent, setUserProperties }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

// Custom hook to use analytics
export const useAnalyticsContext = () => useContext(AnalyticsContext)
