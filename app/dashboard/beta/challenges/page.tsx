import { Suspense } from "react"
import { LazyDailyChallenges } from "@/components/lazy"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChallengesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Daily Challenges</h1>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        }
      >
        <LazyDailyChallenges />
      </Suspense>
    </div>
  )
}
