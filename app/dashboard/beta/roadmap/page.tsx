import { Suspense } from "react"
import { LazyRoadmapBoard } from "@/components/lazy"
import { Skeleton } from "@/components/ui/skeleton"
import { RoadmapViewSwitcher } from "@/components/roadmap-view-switcher"

export default function RoadmapPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Roadmap</h1>
        <RoadmapViewSwitcher />
      </div>

      <Suspense
        fallback={
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
        }
      >
        <LazyRoadmapBoard />
      </Suspense>
    </div>
  )
}
