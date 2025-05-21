import { Suspense } from "react"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { LazyRecentChats, LazyActiveRooms, LazyFriendSuggestions } from "@/components/lazy"
import { ActivityFeed } from "@/components/feed/activity-feed"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Your Feed</h2>
        <ActivityFeed limit={3} />
        <div className="mt-4">
          <a href="/dashboard/feed" className="text-blue-600 hover:text-blue-800 font-medium">
            View full feed →
          </a>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <LazyRecentChats />
          <LazyActiveRooms />
          <LazyFriendSuggestions />
        </div>
      </Suspense>
    </div>
  )
}
