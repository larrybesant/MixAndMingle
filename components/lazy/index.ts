import { withLazyLoading } from "./with-lazy-loading"
import { Skeleton } from "@/components/ui/skeleton"

// Video Room Component
export const LazyVideoRoom = withLazyLoading(() => import("../video-room"), {
  fallback: (
    <div className="rounded-lg border p-8 text-center">
      <Skeleton className="h-[300px] w-full rounded-lg" />
      <Skeleton className="h-8 w-48 mx-auto mt-4" />
    </div>
  ),
})

// Enhanced Chat Room Component
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

// Virtual Gifts Component
export const LazyVirtualGifts = withLazyLoading(() => import("../virtual-gifts"), {
  fallback: <Skeleton className="h-[400px] w-full rounded-lg" />,
})

// Subscription Plans Component
export const LazySubscriptionPlans = withLazyLoading(() => import("../subscription-plans"), {
  fallback: (
    <div className="grid gap-4 md:grid-cols-3">
      <Skeleton className="h-[300px] rounded-lg" />
      <Skeleton className="h-[300px] rounded-lg" />
      <Skeleton className="h-[300px] rounded-lg" />
    </div>
  ),
})

// Profile Editor Component
export const LazyProfileEditor = withLazyLoading(() => import("../profile-editor"), {
  fallback: <Skeleton className="h-[500px] w-full rounded-lg" />,
})

// Roadmap Timeline Component
export const LazyRoadmapTimeline = withLazyLoading(
  () =>
    import("../roadmap-timeline").then((mod) => ({
      default: mod.RoadmapTimeline,
    })),
  {
    fallback: <Skeleton className="h-[600px] w-full rounded-lg" />,
  },
)

// Analytics Components
export const LazyBetaEngagementChart = withLazyLoading(() => import("../analytics/beta-engagement-chart"), {
  fallback: <Skeleton className="h-[300px] w-full rounded-lg" />,
})

export const LazyFeedbackAnalytics = withLazyLoading(() => import("../analytics/beta-feedback-analytics"), {
  fallback: <Skeleton className="h-[400px] w-full rounded-lg" />,
})

// Recent Chats Component
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

// Active Rooms Component
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

// Friend Suggestions Component
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
