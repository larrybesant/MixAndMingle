import { Suspense } from "react"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { LazyRecentChats, LazyActiveRooms, LazyFriendSuggestions } from "@/components/lazy"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
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
