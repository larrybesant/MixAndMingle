import { Suspense } from "react"
import { RoadmapBoard } from "@/components/roadmap-board"
import { RecentRoadmapUpdates } from "@/components/recent-roadmap-updates"
import { getRoadmapItemsByStatus, getRecentRoadmapUpdates } from "@/lib/roadmap-service"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Beta Roadmap | Mix & Mingle",
  description: "See what features are coming next to Mix & Mingle based on beta tester feedback",
}

async function RoadmapContent() {
  const [plannedItems, inProgressItems, completedItems, onHoldItems, recentUpdates] = await Promise.all([
    getRoadmapItemsByStatus("planned"),
    getRoadmapItemsByStatus("in-progress"),
    getRoadmapItemsByStatus("completed"),
    getRoadmapItemsByStatus("on-hold"),
    getRecentRoadmapUpdates(5),
  ])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RoadmapBoard
            plannedItems={plannedItems}
            inProgressItems={inProgressItems}
            completedItems={completedItems}
            onHoldItems={onHoldItems}
          />
        </div>
        <div>
          <RecentRoadmapUpdates updates={recentUpdates} />
        </div>
      </div>
    </div>
  )
}

function RoadmapSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton className="h-[600px] w-full" />
        </div>
        <div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </div>
  )
}

export default function RoadmapPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mix & Mingle Public Roadmap</h1>
        <p className="text-gray-600">
          See what features we're working on based on your feedback. Vote on items to help us prioritize!
        </p>
      </div>

      <Suspense fallback={<RoadmapSkeleton />}>
        <RoadmapContent />
      </Suspense>
    </div>
  )
}
