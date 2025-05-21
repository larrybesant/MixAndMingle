import { Suspense } from "react"
import { LazyOnboardingFlow } from "@/components/lazy"
import { Skeleton } from "@/components/ui/skeleton"

export default function OnboardingPage() {
  return (
    <div className="container max-w-4xl py-12">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <div className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        }
      >
        <LazyOnboardingFlow />
      </Suspense>
    </div>
  )
}
