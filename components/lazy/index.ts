import { withLazyLoading } from "./with-lazy-loading"
import { Skeleton } from "@/components/ui/skeleton"

// Existing lazy components
export const LazyVideoRoom = withLazyLoading(() => import("../video-room"), {
  fallback: (
    <div className="rounded-lg border p-8 text-center">
      <Skeleton className="h-[300px] w-full rounded-lg" />
      <Skeleton className="h-8 w-48 mx-auto mt-4" />
    </div>
  ),
})

export const LazyEnhancedChatRoom = withLazyLoading(() => import("../enhanced-chat-room"), {
  fallback: (
    <div className="rounded-lg border p-4">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-10 w-full mt-4" />
    </div>
  ),
})

export const LazyVirtualGifts = withLazyLoading(() => import("../virtual-gifts"), {
  fallback: <Skeleton className="h-[400px] w-full rounded-lg" />,
})

export const LazySubscriptionPlans = withLazyLoading(() => import("../subscription-plans"), {
  fallback: (
    <div className="grid gap-4 md:grid-cols-3">
      <Skeleton className="h-[300px] rounded-lg" />
      <Skeleton className="h-[300px] rounded-lg" />
      <Skeleton className="h-[300px] rounded-lg" />
    </div>
  ),
})

export const LazyProfileEditor = withLazyLoading(() => import("../profile-editor"), {
  fallback: <Skeleton className="h-[500px] w-full rounded-lg" />,
})

export const LazyRoadmapTimeline = withLazyLoading(
  () =>
    import("../roadmap-timeline").then((mod) => ({
      default: mod.RoadmapTimeline,
    })),
  {
    fallback: <Skeleton className="h-[600px] w-full rounded-lg" />,
  },
)

export const LazyBetaEngagementChart = withLazyLoading(() => import("../analytics/beta-engagement-chart"), {
  fallback: <Skeleton className="h-[300px] w-full rounded-lg" />,
})

export const LazyFeedbackAnalytics = withLazyLoading(() => import("../analytics/beta-feedback-analytics"), {
  fallback: <Skeleton className="h-[400px] w-full rounded-lg" />,
})

export const LazyRecentChats = withLazyLoading(() => import("../recent-chats"), {
  fallback: (
    <div className="rounded-lg border p-4">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  ),
})

export const LazyActiveRooms = withLazyLoading(() => import("../active-rooms"), {
  fallback: (
    <div className="rounded-lg border p-4">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    </div>
  ),
})

export const LazyFriendSuggestions = withLazyLoading(() => import("../friend-suggestions"), {
  fallback: (
    <div className="rounded-lg border p-4">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  ),
})

// New lazy components

// Beta Features Component
export const LazyBetaFeatures = withLazyLoading(() => import("../beta-features"), {
  fallback: (
    <div className="space-y-6">
      <Skeleton className="h-10 w-3/4" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-[200px] rounded-lg" />
        <Skeleton className="h-[200px] rounded-lg" />
        <Skeleton className="h-[200px] rounded-lg" />
      </div>
    </div>
  ),
})

// Beta Testimonials Component
export const LazyBetaTestimonials = withLazyLoading(() => import("../beta-testimonials"), {
  fallback: (
    <div className="space-y-6">
      <Skeleton className="h-10 w-3/4" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[150px] rounded-lg" />
        <Skeleton className="h-[150px] rounded-lg" />
      </div>
    </div>
  ),
})

// Beta FAQ Component
export const LazyBetaFAQ = withLazyLoading(() => import("../beta-faq"), {
  fallback: (
    <div className="space-y-6">
      <Skeleton className="h-10 w-3/4" />
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  ),
})

// Video Room Participants Component
export const LazyVideoRoomParticipants = withLazyLoading(() => import("../video-room-participants"), {
  fallback: (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <Skeleton className="aspect-video rounded-lg" />
      <Skeleton className="aspect-video rounded-lg" />
      <Skeleton className="aspect-video rounded-lg" />
      <Skeleton className="aspect-video rounded-lg" />
    </div>
  ),
})

// Subscription Management Component
export const LazySubscriptionManagement = withLazyLoading(() => import("../subscription-management"), {
  fallback: (
    <div className="space-y-6">
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  ),
})

// Animated Logo Component
export const LazyAnimatedLogo = withLazyLoading(() => import("../animated-logo"), {
  fallback: <Skeleton className="h-16 w-16 rounded-full" />,
})

// Onboarding Flow Component
export const LazyOnboardingFlow = withLazyLoading(() => import("../onboarding-flow"), {
  fallback: (
    <div className="space-y-6">
      <Skeleton className="h-10 w-3/4 mx-auto" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
      <div className="flex justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  ),
})

// Notification Bell Component
export const LazyNotificationBell = withLazyLoading(() => import("../notification-bell"), {
  fallback: <Skeleton className="h-10 w-10 rounded-full" />,
})

// Dashboard Nav Component
export const LazyDashboardNav = withLazyLoading(() => import("../dashboard-nav"), {
  fallback: (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  ),
})

// Emoji Picker Component
export const LazyEmojiPicker = withLazyLoading(() => import("../emoji-picker"), {
  fallback: <Skeleton className="h-[300px] w-full rounded-lg" />,
})

// Badge Collection Component
export const LazyBadgeCollection = withLazyLoading(() => import("../badge-collection"), {
  fallback: (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <Skeleton className="h-24 w-24 rounded-full mx-auto" />
      <Skeleton className="h-24 w-24 rounded-full mx-auto" />
      <Skeleton className="h-24 w-24 rounded-full mx-auto" />
      <Skeleton className="h-24 w-24 rounded-full mx-auto" />
    </div>
  ),
})

// Daily Challenges Component
export const LazyDailyChallenges = withLazyLoading(() => import("../daily-challenges"), {
  fallback: (
    <div className="space-y-6">
      <Skeleton className="h-10 w-3/4" />
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  ),
})

// Roadmap Board Component
export const LazyRoadmapBoard = withLazyLoading(() => import("../roadmap-board"), {
  fallback: (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  ),
})

// Analytics Components
export const LazyFeedbackTrendChart = withLazyLoading(() => import("../analytics/feedback-trend-chart"), {
  fallback: <Skeleton className="h-[300px] w-full rounded-lg" />,
})

export const LazyCategoryDistributionChart = withLazyLoading(() => import("../analytics/category-distribution-chart"), {
  fallback: <Skeleton className="h-[300px] w-full rounded-lg" />,
})

export const LazySentimentDistributionChart = withLazyLoading(
  () => import("../analytics/sentiment-distribution-chart"),
  {
    fallback: <Skeleton className="h-[300px] w-full rounded-lg" />,
  },
)

export const LazyFeatureHeatmap = withLazyLoading(() => import("../analytics/feature-heatmap"), {
  fallback: <Skeleton className="h-[400px] w-full rounded-lg" />,
})

export const LazyTagCloud = withLazyLoading(() => import("../analytics/tag-cloud"), {
  fallback: <Skeleton className="h-[300px] w-full rounded-lg" />,
})
