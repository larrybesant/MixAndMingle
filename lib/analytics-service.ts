import { logEvent, setUserId, setUserProperties } from "firebase/analytics"

// Types for our analytics service
export type AnalyticsEvent =
  | "login"
  | "sign_up"
  | "password_reset"
  | "profile_view"
  | "profile_edit"
  | "profile_picture_update"
  | "chat_room_create"
  | "chat_room_join"
  | "message_send"
  | "message_read"
  | "video_room_create"
  | "video_room_join"
  | "video_room_leave"
  | "video_call_duration"
  | "subscription_view"
  | "subscription_start"
  | "subscription_cancel"
  | "subscription_change"
  | "gift_view"
  | "gift_send"
  | "gift_receive"
  | "badge_earn"
  | "badge_view"
  | "badge_showcase"
  | "challenge_view"
  | "challenge_start"
  | "challenge_complete"
  | "feedback_submit"
  | "feedback_vote"
  | "feedback_comment"
  | "page_view"
  | "feature_discover"
  | "search"
  | string // Allow custom events

export type AnalyticsParams = Record<string, any>

export type UserProperties = {
  user_type?: "free" | "premium" | "vip"
  account_age?: number
  total_messages_sent?: number
  total_video_calls?: number
  total_gifts_sent?: number
  total_badges_earned?: number
  total_challenges_completed?: number
  preferred_features?: string
  engagement_score?: number
  [key: string]: any
}

// Analytics service class
class AnalyticsService {
  private analytics: any | null = null
  private isInitialized = false
  private isEnabled = false

  initialize(analyticsInstance: any) {
    this.analytics = analyticsInstance
    this.isInitialized = true

    // Check if user has opted out
    this.isEnabled = localStorage.getItem("analytics_opt_out") !== "true"

    return this
  }

  // Enable or disable analytics
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
    localStorage.setItem("analytics_opt_out", enabled ? "false" : "true")
  }

  // Track an event
  trackEvent(eventName: AnalyticsEvent, eventParams?: AnalyticsParams) {
    if (!this.isInitialized || !this.isEnabled || !this.analytics) {
      return
    }

    try {
      logEvent(this.analytics, eventName, eventParams)
    } catch (error) {
      console.error("Error tracking event:", error)
    }
  }

  // Set user ID for analytics
  setUserId(userId: string | null) {
    if (!this.isInitialized || !this.isEnabled || !this.analytics) {
      return
    }

    try {
      if (userId) {
        setUserId(this.analytics, userId)
      }
    } catch (error) {
      console.error("Error setting user ID:", error)
    }
  }

  // Set user properties
  setUserProperties(properties: UserProperties) {
    if (!this.isInitialized || !this.isEnabled || !this.analytics) {
      return
    }

    try {
      setUserProperties(this.analytics, properties)
    } catch (error) {
      console.error("Error setting user properties:", error)
    }
  }

  // Track page view
  trackPageView(pagePath: string, pageTitle?: string) {
    this.trackEvent("page_view", {
      page_path: pagePath,
      page_title: pageTitle,
    })
  }
}

// Export a singleton instance
export const analyticsService = new AnalyticsService()
