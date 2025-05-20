"use client"

import { useAnalyticsContext } from "@/providers/analytics-provider"

export function useAnalytics() {
  const { isEnabled, setEnabled, trackEvent, setUserProperties } = useAnalyticsContext()

  return {
    isEnabled,
    setEnabled,
    trackEvent,
    setUserProperties,

    // Convenience methods for common events
    trackLogin: (method: string) => trackEvent("login", { method }),
    trackSignUp: (method: string) => trackEvent("sign_up", { method }),
    trackPageView: (pagePath: string, pageTitle?: string) =>
      trackEvent("page_view", { page_path: pagePath, page_title: pageTitle }),
    trackChatRoomJoin: (roomId: string, roomName: string) =>
      trackEvent("chat_room_join", { room_id: roomId, room_name: roomName }),
    trackVideoRoomJoin: (roomId: string, roomName: string) =>
      trackEvent("video_room_join", { room_id: roomId, room_name: roomName }),
    trackMessageSend: (roomId: string, messageType: string) =>
      trackEvent("message_send", { room_id: roomId, message_type: messageType }),
    trackSubscriptionView: () => trackEvent("subscription_view"),
    trackSubscriptionStart: (plan: string, price: number) => trackEvent("subscription_start", { plan, price }),
    trackGiftSend: (giftId: string, giftName: string, recipientId: string) =>
      trackEvent("gift_send", { gift_id: giftId, gift_name: giftName, recipient_id: recipientId }),
    trackBadgeEarn: (badgeId: string, badgeName: string) =>
      trackEvent("badge_earn", { badge_id: badgeId, badge_name: badgeName }),
    trackChallengeComplete: (challengeId: string, challengeName: string) =>
      trackEvent("challenge_complete", { challenge_id: challengeId, challenge_name: challengeName }),
    trackFeedbackSubmit: (feedbackType: string) => trackEvent("feedback_submit", { feedback_type: feedbackType }),
    trackSearch: (query: string, resultsCount: number) => trackEvent("search", { query, results_count: resultsCount }),
  }
}
